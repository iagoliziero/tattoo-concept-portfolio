import type { ComponentType } from "react";
import { Cursor } from "@/components/Cursor";
import { Header } from "@/components/Header";
import { InkSplashes } from "@/components/InkSplashes";
import { MachineLabels } from "@/components/MachineLabels";
import { ProgressLine } from "@/components/ProgressLine";
import { SceneLoader } from "@/components/SceneLoader";
import { ScrollController } from "@/components/ScrollController";
import { SectionEffects } from "@/components/SectionEffects";
import { StructuredData } from "@/components/StructuredData";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Healing } from "@/components/sections/Healing";
import { Hero } from "@/components/sections/Hero";
import { Portfolio } from "@/components/sections/Portfolio";
import { Session } from "@/components/sections/Session";

import { site, type SectionId } from "@/config/site";
import styles from "./page.module.css";

// As seções saem na ordem da navegação da config, que também é a ordem
// que a rolagem e a cena usam (p = 0 a 5).
const sections: Record<SectionId, ComponentType<{ id: SectionId }>> = {
  inicio: Hero,
  sessao: Session,
  cura: Healing,
  trabalhos: Portfolio,
  sobre: About,
  contato: Contact,
};

export default function Page() {
  return (
    <>
      <StructuredData />
      <SceneLoader />
      <Header />
      <ProgressLine />
      <main className={styles.main}>
        {site.nav.map(({ id }) => {
          const Section = sections[id];
          return <Section key={id} id={id} />;
        })}
      </main>
      <MachineLabels />
      <ScrollController />
      <SectionEffects />
      <InkSplashes />
      <Cursor />
    </>
  );
}
