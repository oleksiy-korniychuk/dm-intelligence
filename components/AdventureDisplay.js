'use client';

export default function AdventureDisplay({ adventure }) {
  if (!adventure) return null;

  const getEncounterClass = (type) => {
    switch (type) {
      case 'Combat':
        return 'bg-red-50 dark:bg-red-950';
      case 'Social':
        return 'bg-blue-50 dark:bg-blue-950';
      case 'Exploration':
        return 'bg-green-50 dark:bg-green-950';
      default:
        return 'bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <h1 className="text-2xl font-bold mb-4">{adventure.title}</h1>
      
      <div className="flex gap-4 mb-4 text-sm">
        <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">Players: {adventure.players}</span>
        <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">Level: {adventure.level}</span>
      </div>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Setting</h2>
        <p>{adventure.setting}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Background</h2>
        <p>{adventure.background}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Adventure Hook</h2>
        <p>{adventure.hook}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Plot</h2>
        {adventure.plot.map((act, actIndex) => (
          <div key={actIndex} className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{act.act}</h3>
            <p className="mb-4">{act.description}</p>
            
            <div className="pl-4">
              {act.locations.map((location, locIndex) => (
                <div key={locIndex} className="mb-4">
                  <h4 className="text-md font-semibold mb-2">{location.name}</h4>
                  <p className="mb-2">{location.description}</p>
                  
                  <div className="pl-4">
                    {location.encounters.map((encounter, encIndex) => (
                      <div key={encIndex} className={`mb-3 p-3 rounded ${getEncounterClass(encounter.type)}`}>
                        <div className="text-sm font-medium mb-1">
                          {encounter.type} Encounter
                        </div>
                        <p className="mb-2">{encounter.description}</p>
                        <div className="text-sm">
                          <p><strong>Mechanics:</strong> {encounter.mechanics}</p>
                          <p><strong>Rewards:</strong> {encounter.rewards}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Key NPCs</h2>
        <div className="grid gap-4">
          {adventure.npcs.map((npc, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
              <h3 className="text-lg font-semibold">{npc.name}</h3>
              <p className="text-sm font-medium mb-2">{npc.role}</p>
              <p className="mb-2">{npc.description}</p>
              {npc.stats && <p className="text-sm"><strong>Stats:</strong> {npc.stats}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Conclusion</h2>
        <p>{adventure.conclusion}</p>
      </section>
    </div>
  );
}