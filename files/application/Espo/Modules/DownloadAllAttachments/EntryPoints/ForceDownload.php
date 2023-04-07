<?php

namespace Espo\Modules\DownloadAllAttachments\EntryPoints;

use Espo\Entities\Attachment as AttachmentEntity;
use Espo\Core\Acl;
use Espo\Core\Api\Request;
use Espo\Core\Api\Response;
use Espo\Core\EntryPoint\EntryPoint;
use Espo\Core\Exceptions\BadRequest;
use Espo\Core\Exceptions\Forbidden;
use Espo\Core\Exceptions\NotFoundSilent;
use Espo\Core\FileStorage\Manager as FileStorageManager;
use Espo\Core\ORM\EntityManager;
use Espo\Core\Utils\Metadata;

class ForceDownload implements EntryPoint
{
    public function __construct(
        protected FileStorageManager $fileStorageManager,
        protected Acl $acl,
        protected EntityManager $entityManager,
        private Metadata $metadata
    ) {}

    public function run(Request $request, Response $response): void
    {
        $id = $request->getQueryParam('id');

        if (!$id) {
            throw new BadRequest();
        }

        /** @var ?AttachmentEntity $attachment */
        $attachment = $this->entityManager->getEntityById(AttachmentEntity::ENTITY_TYPE, $id);

        if (!$attachment) {
            throw new NotFoundSilent();
        }

        if (!$this->acl->checkEntity($attachment)) {
            throw new Forbidden();
        }

        if ($attachment->isBeingUploaded()) {
            throw new Forbidden();
        }

        $stream = $this->fileStorageManager->getStream($attachment);

        $outputFileName = str_replace("\"", "\\\"", $attachment->getName() ?? '');

        $type = $attachment->getType();

        $disposition = 'attachment';

        /** @var string[] $inlineMimeTypeList */
        $inlineMimeTypeList = $this->metadata->get(['app', 'file', 'inlineMimeTypeList']) ?? [];

        if (in_array($type, $inlineMimeTypeList)) {
            $disposition = 'attachment';

            $response->setHeader('Content-Security-Policy', "default-src 'self'");
        }

        $response->setHeader('Content-Description', 'File Transfer');

        if ($type) {
            $response->setHeader('Content-Type', $type);
        }

        $size = $stream->getSize() ?? $this->fileStorageManager->getSize($attachment);

        $response
            ->setHeader('Content-Disposition', $disposition . ";filename=\"" . $outputFileName . "\"")
            ->setHeader('Expires', '0')
            ->setHeader('Cache-Control', 'must-revalidate')
            ->setHeader('Pragma', 'public')
            ->setHeader('Content-Length', (string) $size)
            ->setBody($stream);
    }
}