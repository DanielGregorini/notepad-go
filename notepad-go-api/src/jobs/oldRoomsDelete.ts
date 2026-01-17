import SlugRepository from "../repository/slug";

export default class OldRoomsDeleteJob {
  private slugRepository: SlugRepository;
  private intervalMs: number;

  constructor(slugRepository: SlugRepository, intervalMs = 60 * 60 * 1000) {
    // default: roda a cada 1 hora
    this.slugRepository = slugRepository;
    this.intervalMs = intervalMs;
  }

  start() {


    setInterval(async () => {
      console.log("[OldRoomsDeleteJob] Running old rooms deletion job");
      try {
        const now = new Date();

        // 7 days ago
        const oneWeekAgo = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000,
        );

        const deleted = await this.slugRepository.deleteOlderThan(
          oneWeekAgo,
        );

        if (deleted > 0) {
          console.log(
            `[OldRoomsDeleteJob] Deleted ${deleted} old rooms`,
          );
        }
      } catch (err) {
        console.error(
          "[OldRoomsDeleteJob] Error deleting old rooms",
          err,
        );
      }
    }, this.intervalMs);
  }
}
