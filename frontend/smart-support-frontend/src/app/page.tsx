/**
 * Main page component for the Smart Customer Support Bot.
 * 
 * This is the root page that renders the Chat component.
 */

import Chat from '@/components/Chat';

export default function Home() {
  return (
    <main style={{ height: '100vh', margin: 0, padding: 0 }}>
      <Chat />
    </main>
  );
}