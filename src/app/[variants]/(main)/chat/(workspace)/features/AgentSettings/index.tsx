'use client';

import { Drawer } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Suspense, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import PanelTitle from '@/components/PanelTitle';
import { INBOX_SESSION_ID } from '@/const/session';
import AgentChat from '@/features/AgentSetting/AgentChat';
import AgentMeta from '@/features/AgentSetting/AgentMeta';
import AgentModal from '@/features/AgentSetting/AgentModal';
import AgentPlugin from '@/features/AgentSetting/AgentPlugin';
import AgentPrompt from '@/features/AgentSetting/AgentPrompt';
import { AgentSettingsProvider } from '@/features/AgentSetting/AgentSettingsProvider';
import AgentTTS from '@/features/AgentSetting/AgentTTS';
import Footer from '@/features/Setting/Footer';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

import CategoryContent from './CategoryContent';

const AgentSettings = memo(() => {
  const { t } = useTranslation('setting');
  const id = useSessionStore((s) => s.activeId);
  const config = useAgentStore(agentSelectors.currentAgentConfig, isEqual);
  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);
  const { enablePlugins } = useServerConfigStore(featureFlagsSelectors);
  const { isLoading } = useInitAgentConfig();
  const [showAgentSetting, updateAgentConfig] = useAgentStore((s) => [
    s.showAgentSetting,
    s.updateAgentConfig,
  ]);
  const [updateAgentMeta] = useSessionStore((s) => [
    s.updateSessionMeta,
    sessionMetaSelectors.currentAgentTitle(s),
  ]);
  const isInbox = id === INBOX_SESSION_ID;

  const [tab, setTab] = useState(isInbox ? ChatSettingsTabs.Prompt : ChatSettingsTabs.Meta);

  const { md = true } = useResponsive();

  const category = <CategoryContent setTab={setTab} tab={tab} />;
  return (
    <AgentSettingsProvider
      config={config}
      id={id}
      loading={isLoading}
      meta={meta}
      onConfigChange={updateAgentConfig}
      onMetaChange={updateAgentMeta}
    >
      <Drawer
        containerMaxWidth={1280}
        height={'100vh'}
        noHeader
        onClose={() => useAgentStore.setState({ showAgentSetting: false })}
        open={showAgentSetting}
        placement={'bottom'}
        sidebar={
          md && (
            <Flexbox
              gap={20}
              style={{
                minHeight: '100%',
              }}
            >
              <PanelTitle desc={t('header.sessionDesc')} title={t('header.session')} />
              {category}
              <BrandWatermark paddingInline={12} />
            </Flexbox>
          )
        }
        sidebarWidth={280}
        styles={{
          sidebarContent: {
            gap: 48,
            justifyContent: 'space-between',
            minHeight: '100%',
            paddingBlock: 24,
            paddingInline: 48,
          },
        }}
      >
        <Suspense fallback={<Skeleton paragraph={{ rows: 6 }} title={false} />}>
          {tab === ChatSettingsTabs.Meta && <AgentMeta />}
          {tab === ChatSettingsTabs.Prompt && <AgentPrompt />}
          {tab === ChatSettingsTabs.Chat && <AgentChat />}
          {tab === ChatSettingsTabs.Modal && <AgentModal />}
          {tab === ChatSettingsTabs.TTS && <AgentTTS />}
          {enablePlugins && tab === ChatSettingsTabs.Plugin && <AgentPlugin />}
        </Suspense>
        <Footer />
      </Drawer>
    </AgentSettingsProvider>
  );
});

export default AgentSettings;
