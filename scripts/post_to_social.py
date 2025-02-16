# scripts/post_to_social.py
"""
Posting to Twitter and Instagram using respective APIs.
"""

import sys
import logging
import requests
import tweepy

import scripts.config as config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def post_twitter(image_path: str, message: str) -> None:
    """
    Post an image + message to Twitter using credentials from config.
    """
    if not all([
        config.TWITTER_API_KEY,
        config.TWITTER_API_SECRET,
        config.TWITTER_ACCESS_TOKEN,
        config.TWITTER_ACCESS_SECRET
    ]):
        logger.warning("Twitter credentials missing or incomplete, skipping.")
        return

    auth = tweepy.OAuth1UserHandler(
        config.TWITTER_API_KEY,
        config.TWITTER_API_SECRET,
        config.TWITTER_ACCESS_TOKEN,
        config.TWITTER_ACCESS_SECRET
    )
    api = tweepy.API(auth)
    media = api.media_upload(image_path)
    api.update_status(status=message, media_ids=[media.media_id])
    logger.info("Tweet posted successfully.")

def post_instagram(image_path: str, caption: str) -> None:
    """
    Post an image + caption to Instagram using the Graph API.
    Note that Instagram often requires a publicly accessible URL for images.
    """
    if not all([config.INSTAGRAM_USER_ID, config.INSTAGRAM_PAGE_ACCESS_TOKEN]):
        logger.warning("Instagram credentials missing or incomplete, skipping.")
        return

    # Minimal example (requires a public image URL, not a local file path).
    # For a real approach, you would host the image or do a multipart upload if supported.
    logger.warning("Instagram Graph API typically requires a publicly accessible image_url.")

    create_url = f"https://graph.facebook.com/v16.0/{config.INSTAGRAM_USER_ID}/media"
    params = {
        "image_url": f"file://{image_path}",
        "caption": caption,
        "access_token": config.INSTAGRAM_PAGE_ACCESS_TOKEN
    }
    resp = requests.post(create_url, data=params)
    if resp.status_code != 200:
        logger.error("IG media creation failed: %s", resp.text)
        return
    media_id = resp.json().get("id")

    publish_url = f"https://graph.facebook.com/v16.0/{config.INSTAGRAM_USER_ID}/media_publish"
    publish_params = {
        "creation_id": media_id,
        "access_token": config.INSTAGRAM_PAGE_ACCESS_TOKEN
    }
    pub_resp = requests.post(publish_url, data=publish_params)
    if pub_resp.status_code == 200:
        logger.info("Instagram post published.")
    else:
        logger.error("IG publish failed: %s", pub_resp.text)

if __name__ == "__main__":
    """
    Usage:
      python -m scripts.post_to_social screenshot.png "Daily proof" --twitter --instagram
    """
    if len(sys.argv) < 3:
        print("Usage: post_to_social.py <image_path> <message> [--twitter] [--instagram]")
        sys.exit(1)

    image_path = sys.argv[1]
    message = sys.argv[2]
    do_twitter = "--twitter" in sys.argv
    do_instagram = "--instagram" in sys.argv

    if not do_twitter and not do_instagram:
        do_twitter = True

    if do_twitter:
        post_twitter(image_path, message)
    if do_instagram:
        post_instagram(image_path, message)
