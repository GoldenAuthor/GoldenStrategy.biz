import re
import glob
import os

os.chdir(r"e:\xampp\htdocs\golden")
pattern = re.compile(
    r'(<a class="btn btn-primary" href=")[^"]*(">Book Tiffany</a>)'
)
for path in glob.glob("*.html"):
    with open(path, encoding="utf-8", errors="ignore") as fh:
        text = fh.read()
    new_text, count = pattern.subn(r"\1contact.html\2", text)
    if count:
        with open(path, "w", encoding="utf-8", newline="") as fh:
            fh.write(new_text)
        print(f"{path}: Book Tiffany -> contact.html ({count})")
    else:
        # also catch any remaining Book Tiffany with other class patterns
        found = re.findall(r'<a[^>]*>Book Tiffany</a>', text)
        print(f"{path}: {found or 'no Book Tiffany'}")
