import React from "react";
import "./About.css";
import Hero from "../../assets/About/Hero.png";
import Main from "../../assets/About/Main.png";
import Thumb from "../../assets/about/Thumb.png";
import TimelineImg1 from "../../assets/About/Timeline1.png";
import TimelineImg2 from "../../assets/About/Timeline2.png";
import ManifestoImg1 from "../../assets/About/Manifesto1.png";
import ManifestoImg2 from "../../assets/About/Manifesto2.png";
import ManifestoImg3 from "../../assets/About/Manifesto3.png";
import CustomerImg1 from "../../assets/About/Customer1.png";
import CustomerImg2 from "../../assets/About/Customer2.png";
import CustomerImg3 from "../../assets/About/Customer3.png";
import CustomerImg4 from "../../assets/About/Customer4.png"; 
import CustomerGroup from "../../assets/About/CustomerGroup.png";
import FinalCtaBg from "../../assets/About/FinalCtaBg.png";

export default function AboutPage() {
  return (
    <div className="about-page">
      <section 
        className="hero hero-bg-image" 
        style={{ backgroundImage: `url(${Hero})` }}
      >
        <div className="hero-content">
          <p className="eyebrow eyebrow-light">Our Story</p>
          <h1 className="hero-title title-light">
            Comfort, Made
            <br />
            With Intention.
          </h1>
          <p className="hero-copy hero-copy-light">
            We believe that clothing should never feel like a compromise. Explore our
            journey to craft everyday nightwear dedicated to comfort and effortless grace.
          </p>
          <div className="hero-actions">
            <button className="btn-filled"><span className="desktop-text">EXPLORE COLLECTION</span>
            <span className="mobile-text">EXPLORE</span></button>
            <button className="btn-link btn-link-light">DISCOVER OUR STORY</button>
          </div>
        </div>
      </section>
      <section className="intro">
        <div className="intro-text">
          <h2 className="section-title">
            Because comfort should never mean
            compromising on how you feel.
          </h2>
          <p className="body-copy">
            In a world that demands so much of our energy, your home and your rest should be sacred. 
            We started with a simple realization: the transition from the world to the home was lacking 
            a uniform that felt both elevated and effortless.
          </p>
          <p className="body-copy">
            Every seam, every fabric choice, and every silhouette is designed with the human body in mind—honoring 
            its movements, its needs, and its desire for softness.
          </p>
        </div>

        <div className="intro-images-wrapper">
          <img 
            src={Thumb} 
            alt="Stacked folded fabrics" 
            className="intro-thumb-img" 
          />
          <img 
            src={Main} 
            alt="Fabric texture" 
            className="intro-main-img" 
          />
        </div>
      </section>

      <section className="evolution">
        <p className="eyebrow center">THE Journey</p>
        <h2 className="section-title center">Evolution of Hazel</h2>

        <div className="timeline">
          <div className="timeline-row timeline-row-reverse">
            <div 
              className="timeline-image" 
              style={{ backgroundImage: `url(${TimelineImg1})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px' }}
            ></div>
            <div className="timeline-text">
              <span className="timeline-number">01</span>
              <div className="timeline-content-group">
                <h3 className="timeline-title">The Beginning</h3>
                <p className="body-copy">
                  It began with a search for the perfect nightgown— <br />
                  one that didn't feel like a costume or an afterthought. We wanted something that felt like a<br />
                  quiet luxury for the self.
                </p>
              </div>
            </div>
          </div>

          <div className="timeline-row">
            <div 
              className="timeline-image" 
              style={{ backgroundImage: `url(${TimelineImg2})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px' }}
            ></div>
            <div className="timeline-text">
              <span className="timeline-number">02</span>
              <div className="timeline-content-group">
                <h3 className="timeline-title">The First Collection</h3>
                <p className="body-copy">
                  Eighteen months of fabric sourcing led us to our signature
                  Modal-Silk blend. We obsessed over the weight, the drape, and
                  the way it breathed. Our first six silhouettes were born from this
                  obsession.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="timeline-text-grid">
          <div className="timeline-text-only">
            <span className="timeline-number">03</span>
            <div className="timeline-content-group">
              <h3 className="timeline-title">Listening to Women</h3>
              <p className="body-copy">
                Our growth wasn't driven by trends, but by<br />
                feedback. We heard from new mothers, busy<br />
                professionals, and creative spirits who all sought<br />
                the same thing: a garment that respected their<br />
                time and comfort.
              </p>
            </div>
          </div>
          <div className="timeline-text-only">
            <span className="timeline-number">04</span>
            <div className="timeline-content-group">
              <h3 className="timeline-title">Where We Are Today</h3>
              <p className="body-copy">
                Today, Lumière is more than a brand; it's a community. We continue to<br />
                design with the same founding principles: premium quality, ethical <br />
                construction, and an unwavering commitment to how you feel.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="manifesto">
        <p className="section-title1 title-light center">OUR PILLARS</p>
        <h2 className="section-title title-light center">Our Manifesto</h2>

        <div className="manifesto-grid">
          <div className="manifesto-card1">
            <div className="manifesto-header-wrap">
              <span className="manifesto-watermark">01</span>
              <h3 className="manifesto-title">Comfort First</h3>
            </div>
            <p className="manifesto-copy">
              If it doesn't feel effortless, it doesn't make the cut. We prioritize tactile experience above all else.
            </p>
            <div 
              className="manifesto-image1" 
              style={{ backgroundImage: `url(${ManifestoImg1})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px' }}
            ></div>
          </div>

          <div className="manifesto-card2">
            <div className="manifesto-header-wrap">
              <span className="manifesto-watermark">02</span>
              <h3 className="manifesto-title">Quality You Can Feel</h3>
            </div>
            <p className="manifesto-copy">
              Longevity is the ultimate sustainability. Our pieces are designed to be loved and lived in for years.
            </p>
            <div 
              className="manifesto-image2" 
              style={{ backgroundImage: `url(${ManifestoImg2})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px' }}
            ></div>
          </div>

          <div className="manifesto-card3">
            <div className="manifesto-header-wrap">
              <span className="manifesto-watermark">03</span>
              <h3 className="manifesto-title">Designed for Real Life</h3>
            </div>
            <p className="manifesto-copy">
              From pockets in nightdresses to feeding-friendly closures, we solve the small frustrations of daily life.
            </p>
            <div 
              className="manifesto-image3" 
              style={{ backgroundImage: `url(${ManifestoImg3})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px' }}
            ></div>
          </div>
        </div>
      </section>

      <section className="customers">
        <h2 className="section-title center">
          Made for the moments
          <br />
          that actually matter.
        </h2>

        <div className="collage">
          <div className="collage-col">
            <div className="collage-tall1" style={{ backgroundImage: `url(${CustomerImg1})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px' }}></div>
            <div className="collage-tall2" style={{ backgroundImage: `url(${CustomerImg2})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px' }}></div>
          </div>
          <div className="collage-center" style={{ backgroundImage: `url(${CustomerGroup})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px' }}></div>
          <div className="collage-col">
            <div className="collage-tall3" style={{ backgroundImage: `url(${CustomerImg3})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px' }}></div>
            {/* Quote card replaced with CustomerImg4 */}
            <div className="collage-tall4" style={{ backgroundImage: `url(${CustomerImg4})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px' }}></div>
          </div>
        </div>
      </section>
      <section className="final-cta">
        <div 
          className="final-cta-image final-bg-image" 
          style={{ backgroundImage: `url(${FinalCtaBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        ></div>
        <div className="final-cta-overlay">
          <h2 className="final-cta-title">
            Comfort is not
            <br />
            something you settle for.
          </h2>
          <button className="btn-filled1">Shop The Collection</button>
        </div>
      </section>
    </div>
  );
}