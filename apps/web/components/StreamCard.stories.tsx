import React from 'react';
import StreamCard from './StreamCard';

// TODO(issue): #T6 — Set up Storybook component library for dApp UI
export default {
  title: 'Components/StreamCard',
  component: StreamCard,
};

const Template = (args: any) => <StreamCard {...args} />;

export const Active = Template.bind({});
(Active as any).args = {
  stream: {
    id: 1n,
    sender: 'GBX...',
    recipient: 'GDY...',
    token: 'USDC',
    totalAmount: 10000000000n,
    startTime: BigInt(Math.floor(Date.now() / 1000) - 3600),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 3600),
    claimedAmount: 0n,
    status: 'Active',
    lastUpdated: BigInt(Math.floor(Date.now() / 1000)),
  },
};
