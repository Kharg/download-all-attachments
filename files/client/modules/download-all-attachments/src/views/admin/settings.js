define('download-all-attachments:views/admin/settings', ['views/settings/record/edit'], function (Dep) {

    return Dep.extend({

        gridLayoutType: 'record',

        events: {
            'click button[data-action="save"]': function () {
                this.actionSave();
                this.broadcastUpdate();
            },
            'click button[data-action="cancel"]': function () {
                this.cancel();
            },
            'click button[data-action="resetToDefault"]': function () {
                this.confirm(this.translate('confirmation', 'messages'), () => {
                    this.resetToDefault();
                    this.broadcastUpdate();
                });
            },
        },

        buttonList: [
            {
                name: 'save',
                label: 'Save',
                style: 'primary',
                title: 'Ctrl+Enter',
            },
            {
                name: 'cancel',
                label: 'Cancel',
            },
            {
                name: 'resetToDefault',
                label: 'Restore',
            }
        ],

        detailLayout: [
            {
                "rows": [
                    [{"name": "DownloadAllAttachments"}, {"name": "DownloadAllAttachmentsStream"}, {"name": "DownloadAllAttachmentsMode"}],
                ],
                "style": "default",
                "label": "Download All Attachments Settings"
            }
        ],

        setup: function () {
            Dep.prototype.setup.call(this);
        },

        afterSave: function () {
            Dep.prototype.afterSave.call(this);
            window.location.reload();
            },

        resetToDefault: function () {
            Espo.Ajax
            .putRequest('Settings/1', {
                DownloadAllAttachments: this.getMetadata().get(['entityDefs', this.scope, 'fields', 'DownloadAllAttachments', 'default']),
                DownloadAllAttachmentsStream: this.getMetadata().get(['entityDefs', this.scope, 'fields', 'DownloadAllAttachmentsStream', 'default']),
                DownloadAllAttachmentsMode: this.getMetadata().get(['entityDefs', this.scope, 'fields', 'DownloadAllAttachmentsMode', 'default']),
            })
            .then(response => {
                this.model.fetch();
                window.location.reload();
            });
        },

        broadcastUpdate: function () {
            this.getHelper().broadcastChannel.postMessage('reload');
        },

    });
});