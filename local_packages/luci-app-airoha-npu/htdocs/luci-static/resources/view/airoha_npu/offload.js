'use strict';
'require view';
'require form';
'require uci';
'require fs';

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('firewall'),
			fs.list('/sys/bus/platform/drivers/airoha-npu').catch(function() { return null; })
		]);
	},

	render: function(data) {
		var defaults = uci.sections('firewall', 'defaults')[0];
		if (!defaults)
			throw new Error(_('Firewall defaults section is missing.'));

		var m = new form.Map('firewall', _('Airoha NPU'),
			_('Hardware flow offloading is disabled by default. Enable it manually and click Save & Apply. These settings are shared with Network > Firewall.'));
		var s = m.section(form.NamedSection, defaults['.name'], 'defaults');
		s.addremove = false;

		var o = s.option(form.DummyValue, '_npu_driver', _('NPU driver'));
		o.cfgvalue = function() {
			if (data[1] === null)
				return _('Unavailable');
			return data[1].some(function(entry) { return /\.npu$/.test(entry.name); })
				? _('Bound to device') : _('Not bound to device');
		};
		o.description = _('Driver binding does not mean that traffic is being hardware offloaded.');

		o = s.option(form.Flag, 'flow_offloading', _('Software flow offloading'));
		o.default = '0';
		o.rmempty = false;
		o.description = _('Required for hardware flow offloading.');

		o = s.option(form.Flag, 'flow_offloading_hw', _('Hardware flow offloading'));
		o.default = '0';
		o.rmempty = false;
		o.depends('flow_offloading', '1');
		o.description = _('Accelerates eligible forwarded traffic. Test proxy routing, traffic accounting and SQM after enabling. Disable both offloading options to return to normal forwarding.');

		return m.render();
	}
});
