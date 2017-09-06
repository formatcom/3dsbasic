jQuery(document).ready(function($) {
	// 読み込み画像
	var image = new Image();
	image.src = _mwc.loading_img_url;
	$.fn.putLoadingImg = function() {
		return $('<img>', { src: image.src, class: 'mwc-loading' }).prependTo(this);
	};

	// ajax初期設定
	var ajax = {
		url: _mwc.ajax_url,
		type: 'POST',
		dataType: 'json',
		timeout: 10000,
		cache : false
	};

	// 拍手処理
	$('body').on('click', 'div.mwc-claping > button:not(.disabled)', function(event) {
		event.preventDefault();

		var btnObj = $(this);
		var mwcObj = btnObj.closest('.maroyaka-webclap');

		btnObj.
			blur(). // フォーカスアウト
			addClass('disabled'); // クリック禁止

		var loadingImg = btnObj.putLoadingImg(); // 読み込み画像表示

		$.ajax($.extend({
			data: {
				'action': 'claping',
				'_ajax_nonce': _mwc.ajax_nonce,
				'post_id': btnObj.data('id')
			}
		}, ajax)).
		always(function() {
			btnObj.removeClass('disabled'); // クリック許可
			loadingImg.remove(); // 読み込み画像非表示
		}).
		fail(function(xhr, status, error) {
			var res = xhr.status + ' ' + xhr.statusText;
			alert(res);
		}).
		done(function(data) {
			// nonceチェック
			if (data <= 0) {
				alert('処理が中断されました。');
				return;
			}

			// エラー
			if (data.error) {
				alert(data.error);
				return;
			}

			// 数値増加
			mwcObj.find('.count').text(data.count);

			// メッセージボックス
			if (!$('div#mwc-message-box-' + data.post_id)[0]) {
				var msgBox =
				'<div class="maroyaka-webclap mwc-message-box" id="mwc-message-box-' + data.post_id + '" style="display: none;">' +
					'<div class="mwc-message-box-inner">' +
						'<img src="' + data.close_img + '" class="close" title="閉じる" />';

						// お礼メッセージ
						if (data.thanks_msg) {
							msgBox += '<p>' + data.thanks_msg + '</p>';
						}

						msgBox +=
						'<form action="" name="mwc-message-form">' +
							'<input type="hidden" name="action" value="send_message" />' +
							'<input type="hidden" name="post_id" value="' + data.post_id + '" />' +
							'<input type="hidden" name="clap_id" value="' + data.clap_id + '" />' +
							'<input type="hidden" name="_ajax_nonce" value="' + data.ajax_nonce + '" />';

							// 名前入力欄
							if (data.name_input) {
								msgBox += '<input type="text" name="name" value="" class="form-control" placeholder="お名前">';
							}

							// 定型文選択欄
							if (data.set_phrases_select && data.set_phrases.length > 0) {
								msgBox += '<select name="set_phrases" class="form-control">';
								msgBox += '<option value="">▼定型文</option>';
								for (var i = 0; i < data.set_phrases.length; i++) {
									if (data.set_phrases[i]) msgBox += '<option value="' + data.set_phrases[i] + '">' + data.set_phrases[i] + '</option>';
								}
								msgBox += '</select>';
							}

							// メッセージ入力欄
							if (data.message_input) {
								msgBox += '<textarea name="message" rows="5" placeholder="メッセージ" class="form-control"></textarea>';
							}

							// 送信ボタン
							msgBox +=
							'<button type="submit" class="btn btn-primary">送信</button>' +
						'</form>' +
					'</div>' +
				'</div>';
				$('body').append(msgBox);

				// 表示位置指定
				$msgBox = $('#mwc-message-box-' + data.post_id);
				var $win = $(window);

				if ($win.width() > 768) {
					// PC
					var mwcOffset = btnObj.offset();
					var mwcHeight = mwcObj.height();

					var mbTop = mwcOffset.top + mwcHeight + 12;
					var mbLeft = mwcOffset.left;

					// 管理バー
					if ($('#wpadminbar')[0]) {
						mbTop -= $('#wpadminbar').height();
					}

					$msgBox.css({
						top: mbTop,
						left: mbLeft
					}).addClass('arrow').show();
				} else {
					// タブレット
					var mbTop = ($win.height() - $msgBox.height()) / 2 + $win.scrollTop();
					var mbLeft = ($win.width() - $msgBox.width()) / 2 + $win.scrollLeft();
					$msgBox.css({
						top: mbTop,
						left: mbLeft
					}).show();
				}
				$msgBox.find('select, textarea, input[type="text"]')[0].focus();
			} else {
				// 拍手IDのみ更新する
				$('div#mwc-message-box-' + data.post_id).find('input[name="clap_id"]').val(data.clap_id);
			}
		});
	}).
	// メッセージ送信処理
	on('submit', 'form[name="mwc-message-form"]', function(event) {
		event.preventDefault();
		var formObj = $(this);
		var submitBtn = formObj.find('button[type="submit"]');
		var formSerialize = formObj.serializeArray();

		// オブジェクト変換
		var formVal = {};
		$.each(formSerialize, function(i, elem) {
			formVal[elem.name] = elem.value;
		});
		// 入力値チェック
		if (!formVal.message && !formVal.name && !formVal.set_phrases) {
			formObj.find('.alert').remove();
			submitBtn.before('<div class="alert alert-danger">項目を入力してください</div>');
			return;
		}

		// クリック禁止
		submitBtn.prop('disabled', true);

		// ローディング画像表示
		var loadingImg = submitBtn.putLoadingImg();

		$.ajax($.extend({
			data: formVal
		}, ajax)).
		always(function() {
			loadingImg.remove(); // ローディング画像非表示
			submitBtn.prop('disabled', false); // クリック許可
		}).
		fail(function(xhr, status, error) {
			var res = xhr.status + ' ' + xhr.statusText;
			console.log(res);
		}).
		done(function(data, status, xhr) {
			// nonceチェック
			if (data <= 0) {
				alert("処理が中断されました。\nページを再読み込みしてからやり直してください。");
				return;
			}

			formObj[0].reset();
			formObj.find('.alert').remove();
			submitBtn.before('<div class="alert alert-success">送信が完了しました</div>');
		});
	}).
	// メッセージボックスを閉じる
	on('click', 'div.mwc-message-box .close', function() {
		$(this).closest('.mwc-message-box').remove();
	}).
	// ランキング表示
	on('click', '[data-toggle="mwc-ranking"]', function(event) {
		event.preventDefault();
		var $this = $(this);
		var $mwcRankingNavi = $this.closest('.mwc-ranking-navi');
		var widgetID = $mwcRankingNavi.data('widget-id');
		widgetID = widgetID.replace(/maroyakawebclapwidget-(\d+)/, "$1");
		var maxview = $mwcRankingNavi.data('maxview');
		var mode = $this.data('mode');

		$.ajax($.extend({
			data: {
				'action': 'ranking',
				'widgetID': widgetID,
				'maxview': maxview,
				'mode': mode
			}
		}, ajax)).
		fail(function(xhr, status, error) {
			var res = xhr.status + ' ' + xhr.statusText;
			alert(res);
		}).
		done(function(data) {
			if (data.error) {
				alert('処理が中断されました。');
				return;
			}

			$mwcRankingNavi.children('.active').removeClass('active').wrapInner('<a href="#"></a>');

			$this.text($this.children('a').text()).addClass('active');

			$mwcRankingNavi.next('.mwc-ranking-table').children('.tbody').html(data);
		});
	});
});
