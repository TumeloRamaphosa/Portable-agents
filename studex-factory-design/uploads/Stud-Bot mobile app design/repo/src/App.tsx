import { Routes, Route } from 'react-router-dom';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import ProblemStrip from './sections/ProblemStrip';
import StandingArmy from './sections/StandingArmy';
import StudBot from './sections/StudBot';
import YourTeam from './sections/YourTeam';
import ProductPanels from './sections/ProductPanels';
import CinematicVision from './sections/CinematicVision';
import AlumniArchives from './sections/AlumniArchives';
import Deployment from './sections/Deployment';
import Orchestra from './sections/Orchestra';
import Ecosystem from './sections/Ecosystem';
import ScrollWorld from './sections/ScrollWorld';
import AgentLord from './sections/AgentLord';
import Footer from './sections/Footer';
import CapabilityDetail from './sections/CapabilityDetail';
import AudioExperience from './components/AudioExperience';
import LiveTicker from './components/LiveTicker';

function HomePage() {
  return (
    <div
      style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      <LiveTicker />
      <Navigation />

      <main>
        <Hero />
        <ProblemStrip />
        <StandingArmy />
        <StudBot />
        <ProductPanels />
        <YourTeam />
        <AlumniArchives />
        <Deployment />
        <CinematicVision />
        <AgentLord />
        <ScrollWorld />
        <Orchestra />
        <Ecosystem />
        <Footer />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <AudioExperience />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/capability/:slug" element={<CapabilityDetail />} />
      </Routes>
    </>
  );
}
