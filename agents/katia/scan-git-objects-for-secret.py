#!/usr/bin/env python3
"""Scan every object in a git repo for a literal secret, without printing it.

Usage: python3 ops/scan-git-objects-for-secret.py <repo> <secret-file>
Exit 0 = the secret is NOT present; 1 = it IS present (paths only).
The secret is read from a FILE so it never appears on a command line, in a
process listing, or in a shell history.
"""
import subprocess
import sys
from pathlib import Path


def main() -> int:
    repo = sys.argv[1]
    secret = Path(sys.argv[2]).read_text().rstrip("\n").encode()
    if not secret:
        print("  empty secret file")
        return 2

    # Every blob in the object store, including unreachable ones.
    listing = subprocess.run(
        ["git", "-C", repo, "cat-file", "--batch-all-objects",
         "--batch-check=%(objectname) %(objecttype)"],
        capture_output=True, text=True).stdout
    blobs = [ln.split()[0] for ln in listing.splitlines()
             if ln.endswith(" blob")]
    print(f"  {repo}: {len(blobs)} blob(s) in the object store")

    hits = []
    B = 1000
    for i in range(0, len(blobs), B):
        chunk = blobs[i:i + B]
        proc = subprocess.run(
            ["git", "-C", repo, "cat-file", "--batch"],
            input=("\n".join(chunk) + "\n").encode(),
            capture_output=True)
        # --batch output is: <sha> <type> <size>\n<bytes>\n
        buf = proc.stdout
        pos = 0
        for sha in chunk:
            nl = buf.find(b"\n", pos)
            if nl < 0:
                break
            header = buf[pos:nl].decode(errors="replace").split()
            pos = nl + 1
            if len(header) < 3:
                continue
            size = int(header[2])
            body = buf[pos:pos + size]
            pos += size + 1
            if secret in body:
                hits.append(sha)
    if hits:
        print(f"  *** THE SECRET IS IN {len(hits)} BLOB(S): {hits[:10]}")
        return 1
    print("  the secret is NOT in any blob of this object store")
    return 0


if __name__ == "__main__":
    sys.exit(main())
