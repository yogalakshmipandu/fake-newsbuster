from PIL import Image, ImageDraw, ImageFont
import os

def create_icon():
    # Create a 128x128 image with white background
    img = Image.new('RGBA', (128, 128), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a magnifying glass
    draw.ellipse((20, 20, 108, 108), outline='blue', width=5)
    draw.line((80, 80, 120, 120), fill='blue', width=5)
    
    # Save the image
    img.save('icon.png')

if __name__ == '__main__':
    create_icon() 