# XG-040G-MD ImmortalWrt Snapshot Build

This repository builds ImmortalWrt for Nokia/Bell XG-040G-MD through GitHub Actions.

It clones official `immortalwrt/immortalwrt`, then builds the Airoha AN7581
`nokia_xg-040g-md-ubi` target from the selected branch. This UBI profile is
the intended profile for TC U-Boot style installs. The default source branch is
`master`, which is the ImmortalWrt snapshot development branch.

Important:

- This repository is only an automated build wrapper; firmware sources are
  pulled from the official ImmortalWrt repository.
- The default build is a snapshot build, not an official stable release.
- For TC U-Boot installs, use the `nokia_xg-040g-md-ubi` `sysupgrade.itb`
  image, not the non-UBI `sysupgrade.bin`.
- XG-PON behavior still needs to be validated on real hardware.

Run manually from GitHub:

1. Open Actions.
2. Select `Build XG-040G-MD ImmortalWrt`.
3. Click `Run workflow`.
4. Keep `base_branch` as `master`, or enter an ImmortalWrt branch that supports the
   XG-040G-MD UBI profile. Start the workflow.
5. Download the firmware artifact after the job finishes, for example
   `xg040gmd-immortalwrt-master`.

The selected repository, branch and source commit are saved in `source.txt` in
the build log artifact.

The build configuration is stored in `configs/xg040gmd.config`. Edit this file
to change packages; configuration is not passed through the workflow input form,
which can lose line breaks. After `make defconfig`, the workflow verifies the
AN7581 XG-040G-MD UBI profile and essential LuCI packages before downloading or
compiling sources.

Simplified Chinese is enabled with `CONFIG_LUCI_LANG_zh_Hans=y`. LuCI translation
packages are hidden Kconfig options driven by this language setting, so selecting
individual `luci-i18n-*-zh-cn` packages alone is insufficient. The workflow checks
that the base interface and Cloudflared Chinese translations remain enabled.

The Argon theme is fetched from the `master` branch of
[`jerrykuku/luci-theme-argon`](https://github.com/jerrykuku/luci-theme-argon)
at build time. Its commit is recorded in `argon-source.txt` in the build logs.

Each run uploads a separate `xg040gmd-immortalwrt-build-logs-<run>-<attempt>` artifact even
when a step fails. It includes the seed and generated configuration, configuration
and download logs, and compilation logs for steps that ran. Failed parallel builds
are retried with one job, with the retry output saved as `build-retry.log`.

Configure software and hardware flow offloading through the standard LuCI
**Network > Firewall** page, then click **Save & Apply**. The custom NPU and SoC
status pages have been removed. This build does not override the upstream
firewall defaults; upgrades retaining a firewall configuration retain its choices.

The upstream AN7581 target enables the NPU driver and this board's device tree
enables its NPU node. The configuration explicitly includes
`airoha-en7581-npu-firmware`, `kmod-nft-offload`, and `conntrack` to preserve
and inspect hardware offloading support.

After flashing, run `dmesg | grep -iE 'airoha|npu|firmware'` to check driver and
firmware startup. During a routed LAN-to-WAN TCP transfer, run
`conntrack -L -o extended 2>/dev/null | grep HW_OFFLOAD`. `HW_OFFLOAD` identifies
hardware-offloaded connections; `OFFLOAD` alone identifies software offload.
Enabling the firewall option alone does not prove hardware acceleration works.

This acceleration targets eligible forwarded traffic, not the userspace
encryption performed by Passwall or Cloudflared. Test proxy routing, traffic
accounting and any SQM configuration after enabling it. To turn off acceleration,
set both `firewall.@defaults[0].flow_offloading` and
`firewall.@defaults[0].flow_offloading_hw` to `0`, commit `firewall`, then restart
the firewall service.

The build configuration disables `/dev/mem` and BusyBox `devmem`.

## Repository origin

Copied from `feng1126/openwrt-build` at commit `8884ff57ba7b1976f4f7bfe63b034a0abab8f1d0`.
Firmware source: https://github.com/immortalwrt/immortalwrt (`master` by default).
Sing-box and PassWall SingBox support are disabled. Xray remains enabled.
