# Module - Download All Attachments
This Extension allows to download all the attachments from a multiple attachment field compressed as a Zip or individually.

## Table of Contents

* [Introduction](#introduction)
* [Requires](#requires)
* [Installation](#installation)
    * [Pre-build extension release](#pre-build-extension-release)

## Introduction

This extension adds two features to the Attachment Multiple field in EspoCRM: 

- display the button on every attachment multiple field. 
- Display the button in the stream panel if attachments are found.

Choose Between 3 different modes:
- Single Mode: Downloads each attachment one by one.
- Zip Mode: Downloads a single archive with all the attachments.
- Dual Mode: Makes both modes available at the same time.

After installation visit /#Admin/DownloadAllAttachments to enable/disable features.

![image](https://user-images.githubusercontent.com/32223252/230526964-271d9c8b-e2ac-43dd-8d4c-11f93a69b423.png)

![image](https://user-images.githubusercontent.com/32223252/230527063-9d5315df-3f4e-458c-9bfd-899007c72562.png)

![image](https://user-images.githubusercontent.com/32223252/230527190-f6a26c77-a318-499a-8dcd-cd714b99ed57.png)


## Requires

- EspoCRM >= 7.2
- PHP >= 7.2

Note: This extension has not been tested with other extensions altering the attachment-multiple.js field and may be incompatible.

## Installation

### Pre-build extension release

1. Download the latest release from [Release page](https://github.com/Kharg/download-all-attachments/releases/latest).
2. Go to **Administration** -> **Extensions** and upload the downloaded file.
