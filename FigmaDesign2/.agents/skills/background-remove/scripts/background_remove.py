import argparse
import sys
from pathlib import Path

def remove_background(input_path: str, output_path: str, method: str = "rembg") -> dict:
    """Remove background from an image using the specified method."""
    try:
        if method == "rembg":
            try:
                import rembg
                with open(input_path, 'rb') as i:
                    with open(output_path, 'wb') as o:
                        input_data = i.read()
                        output_data = rembg.remove(input_data)
                        o.write(output_data)
                return {"success": True, "method": "rembg", "file": output_path}
            except ImportError:
                return {"error": "rembg is not installed. Install with: pip install rembg[gpu] (or pip install rembg for CPU-only)"}
        
        elif method == "builtin":
            from PIL import Image
            img = Image.open(input_path).convert("RGBA")
            datas = img.getdata()
            
            new_data = []
            for item in datas:
                # Change all white (also shades of whites) to transparent
                if item[0] > 240 and item[1] > 240 and item[2] > 240:
                    new_data.append((255, 255, 255, 0))
                else:
                    new_data.append(item)
                    
            img.putdata(new_data)
            # Output format based on extension, fallback to PNG
            ext = Path(output_path).suffix.lower()
            if ext == '.webp':
                img.save(output_path, "WEBP")
            else:
                img.save(output_path, "PNG")
            return {"success": True, "method": "builtin", "file": output_path}
            
        else:
            return {"error": f"Unknown background removal method: {method}"}
            
    except Exception as e:
        return {"error": str(e)}


def main():
    parser = argparse.ArgumentParser(description="Background Remove Skill - Remove backgrounds from images.")
    parser.add_argument("-i", "--input", nargs="+", required=True, help="Input image path(s)")
    parser.add_argument("-o", "--output", help="Output path or directory")
    parser.add_argument("-m", "--method", choices=["rembg", "builtin"], default="rembg", help="Removal method")
    
    args = parser.parse_args()
    
    input_files = [Path(p) for p in args.input]
    
    for in_path in input_files:
        if not in_path.exists():
            print(f"Image not found: {in_path}")
            continue
            
        out_path = args.output
        if not out_path:
            # Default output: same location with _nobg suffix
            out_path = in_path.with_name(f"{in_path.stem}_nobg{in_path.suffix}")
        else:
            out_path = Path(out_path)
            if len(input_files) > 1 or out_path.is_dir():
                out_path.mkdir(parents=True, exist_ok=True)
                out_path = out_path / in_path.name

        result = remove_background(str(in_path), str(out_path), method=args.method)
        
        if result.get("success"):
            print(f"Saved to: {result['file']}")
        else:
            print(f"Error: {result.get('error')}")

if __name__ == "__main__":
    main()
