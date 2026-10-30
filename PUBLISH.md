# How to publish

Run the `release` workflow from the Actions tab on GitHub (or `gh workflow run release -f bump=patch`). Pick `patch`, `minor` or `major`, or type an exact version. It:

1. Bumps the version in package.json and in the README.md badge
2. Builds and packages the extension into a `.vsix`
3. Commits the bump as `x.y.z` on `main` and tags it `x.y.z`
4. Publishes to the VS Code Marketplace (and to Open VSX when the `OVSX_PAT` secret is set)
5. Creates a GitHub release for the tag, with the `.vsix` attached and notes generated from the merged pull requests

It publishes to the Marketplace through Trusted Publishing, so it needs no token. The policy lives in the `Pinya` publisher on https://marketplace.visualstudio.com/manage, under **Trusted Publishing**: owner `CarlesRojas`, repository `git-go`, workflow `release.yml`, no environment.

To publish by hand instead, update the version in package.json and in the README.md, then run

```sh
vsce publish
```

# How to test

1. Run the `Run Extension` task.
