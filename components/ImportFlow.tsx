import Image from "next/image";
import { ArrowRight, Heart, MessageCircle, Send } from "lucide-react";

import platefulLogo from "@/public/play_store_512.png";
import postPhoto from "@/public/screens/post-photo.jpg";
import screenRecipe from "@/public/screens/screen-recipe.png";
import screenTailor from "@/public/screens/screen-tailor.png";

/**
 * Visual proof of the import flow: a post you'd actually be looking at,
 * shared into Plateful, and the cookable recipe that comes back out.
 */
export function ImportFlow() {
  return (
    <div className="flow">
      <div className="flow-step">
        <div className="phone phone-sm">
          <div className="post">
            <div className="post-head">
              <span className="post-avatar" />
              <span className="post-handle">homecooked.reels</span>
            </div>

            <div
              className="post-photo"
              style={{ backgroundImage: `url(${postPhoto.src})` }}
            />

            <div className="post-actions" aria-hidden="true">
              <Heart size={15} />
              <MessageCircle size={15} />
              <Send size={15} />
            </div>

            <p className="post-caption">
              <b>homecooked.reels</b> Crockpot chicken bowls with yellow rice
              and cilantro pesto
            </p>

            <div className="share-sheet">
              <p className="share-label">Share to</p>
              <div className="share-row">
                <div className="share-app is-target">
                  <span className="tile">
                    <Image src={platefulLogo} alt="" width={40} height={40} />
                  </span>
                  <span className="name">Plateful</span>
                </div>
                <div className="share-app">
                  <span className="tile" />
                  <span className="name">&nbsp;</span>
                </div>
                <div className="share-app">
                  <span className="tile" />
                  <span className="name">&nbsp;</span>
                </div>
                <div className="share-app">
                  <span className="tile" />
                  <span className="name">&nbsp;</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="flow-cap">
          <span className="step">Step 1</span>
          <span className="what">Share any recipe link</span>
        </p>
      </div>

      <div className="flow-arrow" aria-hidden="true">
        <ArrowRight size={22} strokeWidth={2.4} />
      </div>

      <div className="flow-step">
        <div className="phone phone-sm">
          <Image
            src={screenRecipe}
            alt="The same recipe inside Plateful, with ingredients, servings, and diet controls"
            sizes="236px"
          />
        </div>

        <p className="flow-cap">
          <span className="step">Step 2</span>
          <span className="what">Recipe, extracted</span>
        </p>
      </div>

      <div className="flow-arrow" aria-hidden="true">
        <ArrowRight size={22} strokeWidth={2.4} />
      </div>

      <div className="flow-step">
        <div className="phone phone-sm">
          <Image
            src={screenTailor}
            alt="Plateful asking to adapt the recipe to a vegetarian diet using saved preferences"
            sizes="236px"
          />
        </div>

        <p className="flow-cap">
          <span className="step">Step 3</span>
          <span className="what">Adapted to your diet</span>
        </p>
      </div>
    </div>
  );
}
