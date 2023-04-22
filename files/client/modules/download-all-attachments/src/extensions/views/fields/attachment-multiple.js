extend('download-all-attachments:extensions/views/fields/attachment-multiple', function(Dep) {
	return Dep.extend({

		createDownloadAllAttachmentsButton: function(mode) {
			if ((mode === 'detail' && this.isDetailMode()) || (mode === 'list' && this.isListMode() && this.entityType === 'Note')) {
				let nameHash = this.nameHash;
				let downloadMode = this.getConfig().get('DownloadAllAttachmentsMode');

				if (downloadMode === 'Zip') {
					this.createDownloadAllAttachmentsZipButton(nameHash);
				}

				if (downloadMode === 'Single') {
					this.createDownloadAllAttachmentsSingleButton(nameHash);
				}

				if (downloadMode === 'Dual') {
					this.createDownloadAllAttachmentsZipButton(nameHash);
					this.createDownloadAllAttachmentsSingleButton(nameHash, downloadMode);
				}
			}
		},

		createDownloadAllAttachmentsZipButton: function(nameHash) {
			let attachmentBlockLast = this.$el.find('.attachment-block:last');
			let attachmentPreviewLast = this.$el.find('.attachment-preview:last');
			let targetElement = attachmentBlockLast.length ? attachmentBlockLast : attachmentPreviewLast;
            
			targetElement.append(`
            <div id="download-all-button-zip" class="attachment-block">
                <button id="DownloadAllAttachmentsZip" title="Download All Attachments as Zip" class="DownloadAllAttachments btn btn-default" type="button">
                    <span class="fas fa-file-archive"></span>
                </button>
            </div>`
        );

			let downloadAllAttachmentsZipButton = this.$el.find('#DownloadAllAttachmentsZip');
			downloadAllAttachmentsZipButton.on('click', () => {
				this.downloadAllAttachments(nameHash, 'Zip');
			});
		},

		createDownloadAllAttachmentsSingleButton: function(nameHash, downloadMode) {
			let attachmentBlockLast = this.$el.find('.attachment-block:last');
			let attachmentPreviewLast = this.$el.find('.attachment-preview:last');
			let targetElement = (downloadMode === 'Dual') ? this.$el.find('#DownloadAllAttachmentsZip') : (attachmentBlockLast.length ? attachmentBlockLast : attachmentPreviewLast);
		
			targetElement.after(`
				<div id="download-all-button-single" class="attachment-block" style="display:inline-block;">
					<button id="DownloadAllAttachmentsSingle" title="Download All Attachments Individually" class="DownloadAllAttachments btn btn-default" type="button">
						<span class="fas fa-download"></span>
					</button>
				</div>`
			);

			let downloadAllAttachmentsSingleButton = this.$el.find('#DownloadAllAttachmentsSingle');
			downloadAllAttachmentsSingleButton.on('click', () => {
				this.downloadAllAttachments(nameHash, 'Single');
			});
		},

		downloadAllAttachments: function(nameHash, downloadMode) {
			let filename = (this.entityType === 'Note') ? 'Attachments' : this.model.get('name');
			let url = this.getBasePath();

			if (downloadMode === 'Zip') {
				url += '?entryPoint=DownloadAll&name=' + filename;
				let i = 0;
				for (let id in nameHash) {
					url += '&id[' + i + ']=' + id;
					i++;
				}
				window.open(url, '_blank');
			} else if (downloadMode === 'Single') {
				for (let id in nameHash) {
					let separateUrl = url + '?entryPoint=ForceDownload&id=' + id;
					let iframe = document.createElement('iframe');
					iframe.style.display = 'none';
					iframe.src = separateUrl;
					document.body.appendChild(iframe);
					iframe.onload = function() {
						document.body.removeChild(iframe);
					};
				}
			}
		},

		afterRender: function() {
			Dep.prototype.afterRender.call(this);
			if (this.getConfig().get('DownloadAllAttachments')) {
				this.createDownloadAllAttachmentsButton('detail');
			}
			if (this.getConfig().get('DownloadAllAttachmentsStream')) {
				this.createDownloadAllAttachmentsButton('list');
			}
		}
	});
});