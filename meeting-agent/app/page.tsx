import Link from "next/link";


export default function Home() {
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white px-6 py-12">

      <header className="flex justify-between items-center max-w-6xl mx-auto mb-20">
        <h1 className="text-3xl font-bold text-green-400 tracking-tight">EchoNote</h1>
        <nav>
          <Link href="/chat" className="text-white hover:text-green-400 text-lg">
            Chat
          </Link>
        </nav>
      </header>

  
      <main className="max-w-5xl mx-auto text-center">
        <h2 className="text-5xl font-extrabold mb-6 leading-tight">
          Let AI Handle <span className="text-green-400">Your Meetings</span>
        </h2>
        <p className="text-gray-400 text-[17px] leading-relaxed mb-12 max-w-3xl mx-auto tracking-wide">
  EchoNote seamlessly records, transcribes, and stores your meeting transcripts, allowing you to stay fully engaged in the conversation. After the meeting, you can interact with the AI assistant to ask context-aware questions based on the recorded discussion.
</p>


        <Link href="/chat">
          <button className="bg-green-500 hover:bg-green-600 text-black font-semibold py-3 px-8 rounded-full text-lg transition-all duration-300 shadow-md hover:scale-105">
            Get Started →
          </button>
        </Link>
      </main>

      <section className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
      <FeatureCard
  icon={<img src="/cmd.gif" alt="Recording icon" className="w-8 h-8" />}
  title="Command-Based Recording"
  desc="Initiate and stop OBS recordings using simple text prompts—no voice activation required."
/>

<FeatureCard
  icon={<img src="/sp.gif" alt="Recording icon" className="w-8 h-8" />}
  title="Speaker-Tagged Transcriptions"
  desc="Get accurate, labeled transcripts using Speaker Diarization, delivered moments after your meeting."
/>

<FeatureCard
  icon="🧠"
  title="AI-Generated Meeting Titles"
  desc="Automatically provides concise title for the meeting transcript with relevant context."
/>

<FeatureCard
  icon="💬"
  title="Smart Meeting Q&A"
  desc="Ask detailed questions about your meeting transcript with context-aware AI responses."
/>

      </section>

      <footer className="mt-28 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} EchoNote — A Smart Meeting AI Agent 
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-green-400 shadow-md transition-all duration-300">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}
