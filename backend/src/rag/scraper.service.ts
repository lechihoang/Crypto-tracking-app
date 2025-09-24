import { Injectable } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import * as cheerio from 'cheerio';
import { ScrapedContent, CryptoSource, SourceSelector } from './dto';

@Injectable()
export class ScraperService {
  private readonly cryptoSources: CryptoSource[] = [
    {
      name: 'CoinDesk',
      baseUrl: 'https://www.coindesk.com',
      newsUrl: 'https://www.coindesk.com/news/',
      selector: {
        title: 'h1',
        content: '.articleBody',
        articles: '.card',
        link: 'a'
      }
    },
    {
      name: 'CoinTelegraph',
      baseUrl: 'https://cointelegraph.com',
      newsUrl: 'https://cointelegraph.com/news',
      selector: {
        title: 'h1',
        content: '.post-content',
        articles: '.post-preview',
        link: 'a'
      }
    }
  ];

  async scrapeLatestCryptoNews(limit: number = 20): Promise<ScrapedContent[]> {
    const allContent: ScrapedContent[] = [];

    try {
      // Scrape from actual news websites
      for (const source of this.cryptoSources) {
        try {
          const sourceContent = await this.scrapeFromSource(source, Math.ceil(limit / this.cryptoSources.length));
          allContent.push(...sourceContent);
        } catch (sourceError) {
          console.error(`Error scraping ${source.name}:`, sourceError);
        }
      }

    } catch (error) {
      console.error('Error scraping crypto news:', error);
    }

    return allContent.slice(0, limit);
  }

  private async scrapeFromSource(source: CryptoSource, limit: number): Promise<ScrapedContent[]> {
    let browser: Browser | null = null;
    const content: ScrapedContent[] = [];

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

      // Navigate to news page
      await page.goto(source.newsUrl, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      // Extract article links
      const articleLinks = await page.evaluate((selector: SourceSelector) => {
        const articles = Array.from(document.querySelectorAll(selector.articles));
        return articles
          .map(article => {
            const link = article.querySelector(selector.link);
            const title = article.querySelector('h1, h2, h3, h4, .title, [class*="title"]') as HTMLElement;
            return {
              url: link?.getAttribute('href'),
              title: title?.textContent?.trim()
            };
          })
          .filter(item => item.url && item.title)
          .slice(0, limit);
      }, source.selector);

      // Scrape each article
      for (const article of articleLinks) {
        try {
          const fullUrl = article.url.startsWith('http') ? article.url : `${source.baseUrl}${article.url}`;
          const articleContent = await this.scrapeArticleContent(fullUrl);

          if (articleContent) {
            content.push({
              title: article.title,
              content: articleContent,
              url: fullUrl,
              source: source.name,
              publishedAt: new Date()
            });
          }

          // Delay between requests
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (articleError) {
          console.error(`Error scraping article ${article.url}:`, articleError);
        }
      }

      return content;

    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      return [];
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }


  private async scrapeArticleContent(url: string): Promise<string> {
    let browser = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });

      const page = await browser.newPage();

      // Set user agent to avoid blocking
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

      // Set timeout and navigate
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      // Extract content using multiple selectors
      const content = await page.evaluate(() => {
        const selectors = [
          'article',
          '.article-content',
          '.post-content',
          '.content',
          '.entry-content',
          'main',
          '[role="main"]'
        ];

        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            return element.innerText?.substring(0, 2000) || '';
          }
        }

        // Fallback: get all paragraph text
        const paragraphs = Array.from(document.querySelectorAll('p'));
        return paragraphs
          .map(p => p.innerText)
          .filter(text => text.length > 50)
          .slice(0, 5)
          .join('\n\n')
          .substring(0, 2000);
      });

      return content || '';

    } catch (error) {
      console.error('Error scraping article content:', error);
      return '';
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async scrapeCryptoEducationalContent(): Promise<ScrapedContent[]> {
    // Scrape educational content from actual websites instead of hardcoded data
    const educationalSources = [
      'https://www.coindesk.com/learn/',
      'https://academy.binance.com/en',
      'https://www.investopedia.com/cryptocurrency-4427699'
    ];

    const content: ScrapedContent[] = [];

    for (const url of educationalSources) {
      try {
        const scrapedContent = await this.scrapeArticleContent(url);
        if (scrapedContent) {
          content.push({
            title: `Educational Content from ${new URL(url).hostname}`,
            content: scrapedContent,
            url: url,
            source: 'Educational',
            publishedAt: new Date()
          });
        }
        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`Error scraping educational content from ${url}:`, error);
      }
    }

    return content;
  }
}