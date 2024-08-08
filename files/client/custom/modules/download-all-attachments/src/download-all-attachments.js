Espo.loader.require('views/fields/attachment-multiple', function(AttachmentMultipleFieldView) {

	const s = AttachmentMultipleFieldView.prototype.setup,
		g =AttachmentMultipleFieldView.prototype.getValueForDisplay;

	_.extend(AttachmentMultipleFieldView.prototype, {

		setup() {
			s.call(this);
			this.addActionHandler('downloadAllIndividually', () => this.actionDownloadAllIndividually());
			this.addActionHandler('downloadAllAsZip', () => this.actionDownloadAllAsZip());
		},

		actionDownloadAllIndividually() {
			let attachmentsIds = this.model.get(this.idsName);
			if (!attachmentsIds || attachmentsIds.length === 0) {
				return;
			}
			for (let id of attachmentsIds) {
				let separateUrl = this.getBasePath() + '?entryPoint=ForceDownload&id=' + id;
				let iframe = document.createElement('iframe');
				iframe.style.display = 'none';
				iframe.src = separateUrl;
				document.body.appendChild(iframe);
				iframe.onload = function() {
					document.body.removeChild(iframe);
				};
			}
		},

		actionDownloadAllAsZip() {
			let attachmentsIds = this.model.get(this.idsName);
			if (!attachmentsIds || attachmentsIds.length === 0) {
				return;
			}
			let url = this.getBasePath() + `?entryPoint=DownloadAll&entityType=${this.model.entityType}&entityId=${this.model.id}`;
			for (let id of attachmentsIds) {
				url += `&attachmentIdList[]=${id}`;
			}
			window.location.href = url;
		},

		getValueForDisplay() {
			let value = g.call(this);
			if (!value || (!this.isDownloadAllAttachmentsInDetailEnabled() && !this.isDownloadAllAttachmentsInStreamEnabled())) {
				return value;
			}
			let buttons = [];
			if (this.isToAddDownloadAllAsZipButton()) {
				let title = this.translate('Download all as zip');
				buttons.push(
					$('<div>')
						.append(
							$('<button>', {
								title: title,
								class: 'btn btn-default btn-icon',
								type: 'button',
								'data-action': 'downloadAllAsZip'
							}).append($('<span>', {
								class: 'fas fa-file-archive'
							}))
						)
				);
			}
			if (this.isToAddDownloadAllIndividuallyButton()) {
				let title = this.translate('Download all individually');

				buttons.push(
					$('<div>')
						.append(
							$('<button>', {
								title: title,
								class: 'btn btn-default btn-icon',
								type: 'button',
								'data-action': 'downloadAllIndividually'
							}).append($('<span>', {
								class: 'fas fa-download'
							}))
						)
				);
			}
			const $container = $('<div>')
				.append(value)
				.append(
					$('<div>')
						.addClass('buttons-panel margin floated-row clearfix')
						.append(buttons)
				);

			return $container.get(0).innerHTML;
		},

		isToAddDownloadAllAsZipButton() {
			let mode = this.getDownloadAllAttachmentsMode();
			if (!['Zip', 'Dual'].includes(mode)) {
				return false;
			}
			return this.isToAddButtonBase();
		},

		isToAddDownloadAllIndividuallyButton() {
			let mode = this.getDownloadAllAttachmentsMode();
			if (!['Single', 'Dual'].includes(mode)) {
				return false;
			}
			return this.isToAddButtonBase();
		},

		isToAddButtonBase() {
			return (this.isDownloadAllAttachmentsInDetailEnabled() && this.isDetailMode())
				|| (this.isDownloadAllAttachmentsInStreamEnabled() && this.isListMode() && this.entityType === 'Note');
		},

		getDownloadAllAttachmentsMode() {
			return this.getConfig().get('DownloadAllAttachmentsMode');
		},

		isDownloadAllAttachmentsInDetailEnabled() {
			return !!this.getConfig().get('DownloadAllAttachments');
		},

		isDownloadAllAttachmentsInStreamEnabled() {
			return !!this.getConfig().get('DownloadAllAttachmentsStream');
		}
	})
})