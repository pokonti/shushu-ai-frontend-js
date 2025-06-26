import { Scissors, Wand2, Play, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const useFeatures = () => {
  const { t } = useTranslation();
  
  return [
    {
      icon: <Scissors className="w-8 h-8" />,
      title: t('features.audioEnhancement.title'),
      description: t('features.audioEnhancement.description')
    },
    {
      icon: <Wand2 className="w-8 h-8" />,
      title: t('features.videoAssembly.title'),
      description: t('features.videoAssembly.description')
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: t('features.viralClips.title'),
      description: t('features.viralClips.description')
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: t('features.export.title'),
      description: t('features.export.description')
    }
  ];
};
