#!/usr/bin/env python3
import struct
import zlib

def create_simple_png(size):
    """Create a simple blue square PNG icon"""
    width = height = size
    
    # PNG signature
    png_signature = b'\x89PNG\r\n\x1a\n'
    
    # Create image data - blue square with white border
    image_data = []
    
    for y in range(height):
        row = [0]  # Filter type 0 (None)
        for x in range(width):
            # Create a blue square with white border
            border_width = max(1, size // 16)
            
            if (x < border_width or x >= width - border_width or 
                y < border_width or y >= height - border_width):
                # White border
                row.extend([255, 255, 255])
            else:
                # Blue interior
                row.extend([0, 123, 255])
        
        image_data.extend(row)
    
    # Compress image data
    raw_data = bytes(image_data)
    idat_data = zlib.compress(raw_data)
    
    # IHDR chunk
    ihdr_data = struct.pack('>2I5B', width, height, 8, 2, 0, 0, 0)
    ihdr_chunk = struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data
    ihdr_chunk += struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff)
    
    # IDAT chunk
    idat_chunk = struct.pack('>I', len(idat_data)) + b'IDAT' + idat_data
    idat_chunk += struct.pack('>I', zlib.crc32(b'IDAT' + idat_data) & 0xffffffff)
    
    # IEND chunk
    iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff)
    
    return png_signature + ihdr_chunk + idat_chunk + iend_chunk

if __name__ == "__main__":
    for size in [16, 48, 128]:
        png_data = create_simple_png(size)
        
        with open(f'icons/icon{size}.png', 'wb') as f:
            f.write(png_data)
        
        print(f'Created icon{size}.png ({len(png_data)} bytes)')
    
    print('Icons created successfully!') 