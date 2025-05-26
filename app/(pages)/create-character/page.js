import CreateCharacter from "@/components/CreateCharacter";

export default async function CreateCharacterPage({ searchParams }) {
    const sessionId = crypto.randomUUID();
    const { adventure_id: adventureId} = await searchParams;

    return (
        <div>
            <CreateCharacter sessionId={sessionId} adventureId={adventureId} />
        </div>
    );
}