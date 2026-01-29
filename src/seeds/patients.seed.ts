import { AppDataSource } from "../data-source";
import { Patient } from "../entity/Patient";

async function seed() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(Patient);

  const patients: Partial<Patient>[] = [
    {
      name: "Juan Pérez",
      email: "juan.perez@example.com",
      phoneNumber: "+54 11 1234-5678",
      documentPhotoUrl: "/uploads/documents/document-example.jpg"
    },
    {
      name: "María González",
      email: "maria.gonzalez@example.com",
      phoneNumber: "+54 11 2345-6789",
      documentPhotoUrl: "/uploads/documents/document-example.jpg"
    },
    {
      name: "Carlos Ramírez",
      email: "carlos.ramirez@example.com",
      phoneNumber: "+54 11 3456-7890",
      documentPhotoUrl: "/uploads/documents/document-example.jpg"
    },
  ];

  await repo.save(repo.create(patients));

  // eslint-disable-next-line no-console
  console.log("Seed: 3 patients inserted");

  await AppDataSource.destroy();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Error running seed:", err);
  process.exit(1);
});


