import SlugRepository from "../repository/slug";
import { connectMongo } from "../db/monge";

export default class RoomSyncJob {
  private interval: NodeJS.Timeout | null = null;
  private repo!: SlugRepository;

  constructor(private roomsContent: Record<string, string>, private timeout: number) {}

  async start() {
    const db = await connectMongo();
    this.repo = new SlugRepository(db);

    this.interval = setInterval(() => {
      this.run();
    }, this.timeout);

    console.log("\nRoomSyncJob has been started");
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  private async run() {
    const slugs = Object.keys(this.roomsContent);

    for (const slug of slugs) {
      const content = this.roomsContent[slug];
      await this.repo.updateContext(slug, content);
    }

    console.log(`\n${slugs.length} rooms saved`);
  }
}
