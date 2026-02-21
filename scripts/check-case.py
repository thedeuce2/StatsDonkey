import os

root = r"C:\Users\loxca\.openclaw\workspace\documents\slo-pitch-scorer"
for dirpath, dirnames, filenames in os.walk(root):
    if "node_modules" in dirpath or ".next" in dirpath or ".git" in dirpath:
        continue
    print(f"DIR: {dirpath}")
    for f in filenames:
        print(f"  FILE: {f}")
