# scripts/post_to_social.py
import os
import logging
import argparse
from tweepy import API, OAuthHandler
from instagram_graph_api import InstagramGraphAPI

logger = logging.getLogger(__name__)


def post_twitter(image_path, message):
    auth = OAuthHandler(
        os.getenv("TWITTER_API_KEY"),
        os.getenv("TWITTER_API_SECRET")
    )
    auth.set_access_token(
        os.getenv("TWITTER_ACCESS_TOKEN"),
        os.getenv("TWITTER_ACCESS_SECRET")
    )
    api = API(auth, wait_on_rate_limit=True)
    media = api.media_upload(image_path)
    api.update_status(
        status=message,
        media_ids=[media.media_id]
    )
    logger.info("Posted to Twitter successfully.")


def post_instagram(image_path, message):
    api = InstagramGraphAPI(
        user_id=os.getenv("INSTAGRAM_USER_ID"),
        access_token=os.getenv("INSTAGRAM_PAGE_ACCESS_TOKEN")
    )
    with open(image_path, 'rb') as f:
        api.publish_photo(f, caption=message)
    logger.info("Posted to Instagram successfully.")


def main():
    parser = argparse.ArgumentParser(
        description="Post workout data to social media."
    )
    parser.add_argument(
        "image_path",
        help="Path to the screenshot image"
    )
    parser.add_argument(
        "message",
        help="Message to post"
    )
    parser.add_argument(
        "--twitter",
        action="store_true",
        help="Post to Twitter"
    )
    parser.add_argument(
        "--instagram",
        action="store_true",
        help="Post to Instagram"
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO)

    if args.twitter:
        post_twitter(args.image_path, args.message)
    if args.instagram:
        post_instagram(args.image_path, args.message)

if __name__ == "__main__":
    main()
