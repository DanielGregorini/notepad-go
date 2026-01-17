import SlugRepository from "../repository/slug";
import { connectMongo } from "../db/monge";

export default class RoomSyncJob {
  private interval: NodeJS.Timeout | null = null;
  private repo!: SlugRepository;

  constructor(
    private roomsContent: Record<string, string>,
    private timeout: number,
  ) {}

  async start() {
    const db = await connectMongo();
    this.repo = new SlugRepository(db);

    this.interval = setInterval(() => {
      this.run();
    }, this.timeout);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  private async run() {
    console.log("\nRoomSyncJob has been started");
    
    const slugs = Object.keys(this.roomsContent);

    for (const slug of slugs) {
      const exists = await this.repo.exists(slug);
      const content = this.roomsContent[slug];

      if (exists) {
        await this.repo.updateContext(slug, content);
      } else {
        await this.repo.create({
          slug: slug,
          context: content,
        });
      }
    }

    console.log(`\n${slugs.length} rooms saved`);
  }
}
