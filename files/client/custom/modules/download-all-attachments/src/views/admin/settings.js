define('download-all-attachments:views/admin/settings', ['views/settings/record/edit'], function (Dep) {

    return Dep.extend({
        detailLayout: [
            {
                "rows": [
                    [{"name": "DownloadAllAttachments"}, {"name": "DownloadAllAttachmentsStream"}, {"name": "DownloadAllAttachmentsMode"}],
                ],
                "style": "default",
                "label": "Download All Attachments Settings"
            }
        ],

        setup () {
            Dep.prototype.setup.call(this);
            this.buttonList.push({
                name: 'resetToDefault',
                label: 'Restore'
            });
            this.addActionHandler('save', () => this.actionSave());
            this.addActionHandler('close', () => this.actionClose());
            this.addActionHandler('resetToDefault', () => this.actionResetToDefault());
            this.listenTo(this.model, 'after:save', () => {
                this.getHelper().broadcastChannel.postMessage('reload');
                window.location.reload();
            });
        },

        actionResetToDefault () {
            Espo.Ajax
                .putRequest('Settings/1', {
                    DownloadAllAttachments: this.getMetadata().get(['entityDefs', this.scope, 'fields', 'DownloadAllAttachments', 'default']),
                    DownloadAllAttachmentsStream: this.getMetadata().get(['entityDefs', this.scope, 'fields', 'DownloadAllAttachmentsStream', 'default']),
                    DownloadAllAttachmentsMode: this.getMetadata().get(['entityDefs', this.scope, 'fields', 'DownloadAllAttachmentsMode', 'default']),
                })
                .then(() => window.location.reload());
        }
    });
});