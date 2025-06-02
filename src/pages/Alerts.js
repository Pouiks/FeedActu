import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import ModalPublicationForm from '../components/ModalPublicationForm';
import { useAuth } from '../hooks/useAuth';

const mockAlerts = [
  { id: 1, message: '<p>Alerte A</p>', publicationDate: '2024-05-02T02:00:00', status: 'Publié', residence_id: '1' },
  { id: 2, message: '<p>Alerte B</p>', publicationDate: '2024-05-06T02:00:00', status: 'Brouillon', residence_id: '1' },
];

export default function Alerts() {
  const { residenceId } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [alerts, setAlerts] = useState(mockAlerts);

  const columns = [
    { id: 'message', label: 'Alerte', sortable: false, searchable: true },
    { id: 'publicationDate', label: 'Date de publication', sortable: true, searchable: false },
    { id: 'status', label: 'Statut', sortable: true, searchable: false },
  ];

  const filteredAlerts = alerts.filter(alert => alert.residence_id === residenceId);

  const handleAddAlert = (newAlert) => {
    const alertWithId = { ...newAlert, id: Date.now(), residence_id: residenceId };
    setAlerts(prev => [...prev, alertWithId]);
  };

  const handleRowClick = (alert, navigate) => {
    navigate(`/alerts/${alert.id}`);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Alertes de ma résidence</h2>
        <button onClick={() => setOpenModal(true)}>Nouveau</button>
      </div>

      <DataTable 
        title="Alertes de ma résidence" 
        data={filteredAlerts} 
        columns={columns} 
        onRowClick={handleRowClick}
      />

      <ModalPublicationForm
        open={openModal}
        handleClose={() => setOpenModal(false)}
        onSubmit={handleAddAlert}
        entityName="Alerte"
        fields={[
          { name: 'message', label: 'Message de l\'alerte', type: 'wysiwyg', required: true },
        ]}
      />
    </>
  );
}
