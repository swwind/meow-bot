import { deserializeFeed } from './deps.ts';
          const response = await fetch('https://blog.swwind.me/feeds');
          const xml = await response.text();
          const { feed } = await deserializeFeed(xml, { outputJsonFeed: true });
          console.log(feed);