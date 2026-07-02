import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MissionsTab from '../components/MissionsTab';
import EncountersTab from '../components/EncountersTab';
import PlayersTab from '../components/PlayersTab';

export default function CampaignPage({ campaignId, navigate }) {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [tab, setTab] = useState('missions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [campaignId]);

  const load = async () => {
    setLoading(true);
    try { setCampaign(await api.getCampaign(campaignId)); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="loading-text">Cargando campaña...</div>;
  if (error) return <div className="alert-error">{error}</div>;
  if (!campaign) return null;

  const tabs = [
    { id: 'missions', label: '📜 Misiones' },
    { id: 'encounters', label: '⚔️ Encuentros' },
    { id: 'players', label: '👥 Jugadores' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('dashboard')}>← Volver</button>
          <h1 className="page-title">
            <span className="campaign-icon-lg">{campaign.image}</span>
            {campaign.name}
          </h1>
          <p className="page-sub">{campaign.description}</p>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id}
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {tab === 'missions' && <MissionsTab campaignId={campaignId} campaign={campaign} />}
        {tab === 'encounters' && <EncountersTab campaignId={campaignId} campaign={campaign} />}
        {tab === 'players' && <PlayersTab campaign={campaign} onUpdate={load} />}
      </div>
    </div>
  );
}
