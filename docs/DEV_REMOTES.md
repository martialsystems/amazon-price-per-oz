# Unit Price Sort remotes (private source)

This working tree is the product source. It is not what GitHub shows on the public repo.

| Remote | Repo | Contents |
|--------|------|----------|
| `src` | `martialsystems/amazon-price-per-oz-src` (private) | Full source. Default push target. |
| `origin` | `martialsystems/amazon-price-per-oz` (public) | Landing page + GitHub Pages legal HTML only. |

## Publish

```bash
./scripts/install_dev_hooks.sh
./scripts/push_private_source.sh
./scripts/publish_public_landing.sh
./scripts/publish_github_release.sh
```

`publish_github_release.sh` minifies runtime JS and uploads the zip to the public Releases tab. Do not put `src/` on the public default branch.
