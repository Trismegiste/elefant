/**
 * Provides client-side equivalent to `Controller::add_notification()`.
 * Usage:
 *
 *     $.add_notification('My notification.');
 */
jQuery.add_notification = function (msg) {
	var notices = $.cookie ('elefant_notification');
	if (notices !== null) {
		msg = notices + '|' + msg;
	}
	$.cookie ('elefant_notification', msg, {path: '/'});
};

/**
 * Adds a confirmation to a link and turns its `data-*` properties
 * into a `POST` request. Usage:
 *
 *     <a href="/post/here"
 *        data-id="{{id}}"
 *        onclick="$.confirm_and_post (this, 'Are you sure?')"
 *     >Delete</a>
 */
jQuery.confirm_and_post = function (el, msg) {
	if (window.event) {
		window.event.preventDefault ();
	}

	if (! confirm (msg)) {
		return false;
	}

	var $el = $(el),
		params = $el.data ()
		url = $el.attr ('href'),
		$form = $('<form>')
			.attr ('method', 'post')
			.attr ('action', url);

	$.each (params, function (name, value) {
		$('<input type="hidden">')
			.attr ('name', name)
			.attr ('value', value)
			.appendTo ($form);
	});

	$form.appendTo ('body');
	$form.submit ();
	return false;
};

$(function () {
	var sliding_up = false;
	$('body').append ('<div id="admin-bar"><div id="admin-links"></div><a href="/"><img id="admin-logo" src="/apps/admin/css/admin/spacer.png" alt="" /></a></div>');
	$.get ('/admin/head/links', function (res) {
		$('#admin-logo').attr ('src', res.logo).attr ('alt', res.name);
		$('#admin-links').append (res.links);
		$('#admin-tools').hover (function () {
			if (! sliding_up) {
				$('#admin-tools-list').slideDown ('fast').show ();
			}
			$(this).parent ().hover (
				function () {},
				function () {
					sliding_up = true;
					$('#admin-tools-list').slideUp ('slow', function () {
						sliding_up = false;
					});
				}
			);
		})
	});
	$('.admin-options a').hover (
		function () {
			this.tip = this.title;
			$(this).append (
				'<div class="admin-tooltip"><div class="admin-tooltip-top"></div>' +
				'<div class="admin-tooltip-body">' + this.tip + '</div></div>'
			);
			this.title = '';
			$('.admin-tooltip').fadeIn (100);
		},
		function () {
			$('.admin-tooltip').fadeOut (100);
			$('.admin-tooltip').remove ();
			this.title = this.tip;
		}
	);

	// check for and display elefant updates if available
	if (! $.cookie ('elefant_update_checked')) {
		var major_minor = $.elefant_version.replace (/\.[0-9]+$/, '');
		$.getJSON ('http://www.elefantcms.com/updates/check.php?v=' + major_minor + '&callback=?', function (res) {
			if (res.latest > $.elefant_version) {
				$('#admin-bar>a').append ('<a href="http://www.elefantcms.com/download" target="_blank" id="admin-update-available">Update Available: ' + res.latest + '</a>');
			}
		});
		$.cookie ('elefant_update_checked', 1, { expires: 1, path: '/' });
	}

	var jgrowl_interval = function () {
		var notice = $.cookie ('elefant_notification'),
			msglist = [],
			i = 0;

		$.cookie ('elefant_notification', null, {path: '/'});

		if (notice !== null) {
			msglist = notice.split ('|');
			for (i = 0; i < msglist.length; i++) {
				if (msglist[i].length > 0) {
					$.jGrowl (msglist[i].replace (/\+/g, ' '));
				}
			}
		}
		// clear notices
		setTimeout (jgrowl_interval, 1000);
	}

	jgrowl_interval ();
});
