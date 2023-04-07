<?php

class AfterInstall
{
    protected $container;

    public function run($container)
    {
        $this->container = $container;

        $this->clearCache();
        $this->setDownloadAllAttachments();
        $entityManager = $container->get('entityManager');
    }

    protected function clearCache()
    {
        try {
            $this->container->get('dataManager')->clearCache();
        } catch (\Exception $e) {}
    }

    protected function setDownloadAllAttachments()
    {
            $config = $this->container->get('config');
            $config->set('DownloadAllAttachments', true);
            $config->set('DownloadAllAttachmentsMode', "Zip");
            $config->save();
    }
}