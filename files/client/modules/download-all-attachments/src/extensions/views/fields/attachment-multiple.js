extend('download-all-attachments:extensions/views/fields/attachment-multiple', function(Dep) {
	return Dep.extend({

		createDownloadAllAttachmentsButton: function(mode) {
			if ((mode === 'detail' && this.isDetailMode()) || (mode === 'list' && this.isListMode() && this.entityType === 'Note')) {
				let nameHash = this.nameHash;
				this.$el.find('.attachment-block:last')
					.append(`
                        <div id="download-all-button" class="attachment-block">
                            <button id="DownloadAllAttachments" title="Download All Attachments" class="DownloadAllAttachments btn btn-default" type="button">
                                <span class="fas fa-download"></span>
                            </button>
                        </div>`
                        );

				let downloadAllAttachmentsButton = this.$el.find('.attachment-block:last button');
				downloadAllAttachmentsButton.on('click', () => {
					this.downloadAllAttachments(nameHash);
				});
			}
		},

        downloadAllAttachments: function(nameHash) {
            let downloadMode = this.getConfig().get('DownloadAllAttachmentsMode');
            let url = this.getBasePath();
            if (downloadMode === 'Zip') {
                url += '?entryPoint=DownloadAll';
                let i = 0;
                for (let id in nameHash) {
                    url += '&id[' + i + ']=' + id;
                    i++;
                }
                window.open(url, '_blank');
            } else {
                for (let id in nameHash) {
                    let separateUrl = url + '?entryPoint=ForceDownload&id=' + id;
                    window.open(separateUrl, '_blank');
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