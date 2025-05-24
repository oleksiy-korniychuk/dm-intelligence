import CreateCharacter from "@/components/CreateCharacter";

export default async function CreateCharacterPage() {
    const sessionId = crypto.randomUUID();

    return (
        <div>
            <CreateCharacter sessionId={sessionId} />
        </div>
    );
}