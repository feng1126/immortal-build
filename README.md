# XG-040G-MD OpenWrt Snapshot Build

This repository builds OpenWrt for Nokia/Bell XG-040G-MD through GitHub Actions.

It clones official `openwrt/openwrt` directly, then builds the Airoha AN7581
`nokia_xg-040g-md-ubi` target from the selected branch. This UBI profile is
the intended profile for TC U-Boot style installs. The default branch is `main`,
which corresponds to OpenWrt snapshot development builds.

Important:

- This repository is only an automated build wrapper; the OpenWrt source is
  pulled from the official upstream repository.
- The default build is a snapshot build, not an official stable release.
- For TC U-Boot installs, use the `nokia_xg-040g-md-ubi` `sysupgrade.itb`
  image, not the non-UBI `sysupgrade.bin`.
- XG-PON behavior still needs to be validated on real hardware.

Run manually from GitHub:

1. Open Actions.
2. Select `Build XG-040G-MD OpenWrt`.
3. Click `Run workflow`.
4. Download the firmware artifact after the job finishes.

The build configuration is stored in `configs/xg040gmd.config`. Edit this file
to change packages; configuration is not passed through the workflow input form,
which can lose line breaks. After `make defconfig`, the workflow verifies the
AN7581 XG-040G-MD UBI profile and essential LuCI packages before downloading or
compiling sources.

The Argon theme is fetched from the `master` branch of
[`jerrykuku/luci-theme-argon`](https://github.com/jerrykuku/luci-theme-argon)
at build time. Its commit is recorded in `argon-source.txt` in the build logs.

Each run uploads a separate `xg040gmd-build-logs-<run>-<attempt>` artifact even
when a step fails. It includes the seed and generated configuration, configuration
and download logs, and compilation logs for steps that ran. Failed parallel builds
are retried with one job, with the retry output saved as `build-retry.log`.
