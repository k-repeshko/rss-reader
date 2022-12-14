import { makeAutoObservable, runInAction } from "mobx";
import { ListResult } from "store/types/Common";
import { api } from "utils";

interface RssPostFilters {
  feedId: number;
  page: number;
  showRead: boolean;
}

type RssPostsByFeedId = {
  [feedId: number]: RssPost[] | undefined;
};
type NumberByFeedId = {
  [feedId: number]: number | undefined;
};

export class RssPostStore {
  rssPostsByFeedId: RssPostsByFeedId = {};
  pageByFeedId: NumberByFeedId = {};
  totalByFeedId: NumberByFeedId = {};
  loading = false;
  showRead = false;

  constructor() {
    makeAutoObservable(this);
  }

  async load(feedId: number) {
    this.loading = true;
    const page = this.getPageByFeedId(feedId) - 1;
    const result = await api.get<ListResult<RssPost>, RssPostFilters>(`/rss`, {
      feedId,
      page,
      showRead: this.showRead,
    });
    runInAction(() => {
      this.rssPostsByFeedId[feedId] = result.list;
      this.totalByFeedId[feedId] = result.total;
      this.loading = false;
    });
  }

  async reload(feedId: number) {
    this.rssPostsByFeedId[feedId] = [];
    this.load(feedId);
  }

  async hide(rssPost: RssPost, feedId: number) {
    await api.patch(`/rss/${rssPost.id}/hide`);
    await this.load(feedId);
  }

  async read(rssPost: RssPost) {
    rssPost.read = !rssPost.read;
    await api.patch(`/rss/${rssPost.id}/read`);
  }

  async setPage(feedId: number, page: number) {
    this.pageByFeedId[feedId] = page;
    this.rssPostsByFeedId[feedId] = [];
    await this.reload(feedId);
  }

  getRssPostsByFeedId(feedId: number) {
    return this.rssPostsByFeedId[feedId] || [];
  }

  getPageByFeedId(feedId: number) {
    return this.pageByFeedId[feedId] || 1;
  }

  getCountByFeedId(feedId: number) {
    const total = this.totalByFeedId[feedId] || 0;
    return Math.ceil(total / 10);
  }

  getRssPost(feedId: number, postId: number) {
    const rssPosts = this.getRssPostsByFeedId(feedId);
    const rssPost = rssPosts.find((x) => x.id === postId);
    return rssPost;
  }
}

export interface RssPost {
  id: number;
  title: string;
  summary: string;
  url: string;
  publishDate: string;
  feedId: number;
  read: boolean;
}
