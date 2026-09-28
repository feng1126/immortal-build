# XG-040G-MD OpenWrt Snapshot Build

This repository builds OpenWrt or ImmortalWrt for Nokia/Bell XG-040G-MD through
GitHub Actions.

It clones the selected source repository, then builds the Airoha AN7581
`nokia_xg-040g-md-ubi` target from the selected branch. This UBI profile is
the intended profile for TC U-Boot style installs. OpenWrt is selected by default.
When the source branch input is blank, OpenWrt uses `main` and ImmortalWrt uses
`master`; both are snapshot development branches.

Important:

- This repository is only an automated build wrapper; firmware sources are
  pulled from the selected upstream repository.
- The default build is a snapshot build, not an official stable release.
- For TC U-Boot installs, use the `nokia_xg-040g-md-ubi` `sysupgrade.itb`
  image, not the non-UBI `sysupgrade.bin`.
- XG-PON behavior still needs to be validated on real hardware.

Run manually from GitHub:

1. Open Actions.
2. Select `Build XG-040G-MD OpenWrt`.
3. Click `Run workflow`.
4. Choose `openwrt/openwrt` or `immortalwrt/immortalwrt` in `source_repo`.
5. Leave `base_branch` blank for the matching default, or enter a source branch
   that supports the XG-040G-MD UBI profile. Start the workflow.
6. Download the firmware artifact after the job finishes. Its name includes the
   selected project and branch, such as `xg040gmd-immortalwrt-master`.

The selected repository, branch and source commit are saved in `source.txt` in
the build log artifact.

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
