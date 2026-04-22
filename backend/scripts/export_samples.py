import os
from pathlib import Path
import torchvision.datasets as datasets
from config import SAMPLE_IMAGES_DIR, CIFAR10_CLASSES

def main():
    print("Exporting CIFAR-10 sample images...")
    # Ensure directory exists
    SAMPLE_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    
    # Download CIFAR-10 test set into a temporary or data folder
    data_dir = SAMPLE_IMAGES_DIR.parent / "data"
    test_ds = datasets.CIFAR10(root=str(data_dir), train=False, download=True)
    
    exported_classes = set()
    count = 0
    
    # Export one image per class for diversity
    for idx in range(len(test_ds)):
        img, label = test_ds[idx]
        class_name = CIFAR10_CLASSES[label]
        
        if class_name not in exported_classes:
            exported_classes.add(class_name)
            
            # Save as PNG
            filename = f"sample_{count}_{class_name}.png"
            out_path = SAMPLE_IMAGES_DIR / filename
            img.save(out_path)
            
            print(f"[{count+1}/10] Exported {class_name} -> {filename}")
            count += 1
            
            if count == 10:
                break
                
    print(f"Sample images successfully exported to {SAMPLE_IMAGES_DIR}")

if __name__ == "__main__":
    main()
