import React, { useState } from "react";
import "../../styles/CSS/Portfolio.css";
import ScrollArrow from "../../Components/ScrollArrow/ScrollArrow";
import PortfolioItem, {
  ModalPortfolioItem,
} from "../../Components/PortfolioItem/PortfolioItem.jsx";
import PortfolioItems from "./PortfolioItems.jsx";

export default ({ color }) => {
  const [state, setState] = useState({ showingModal: false, modalItem: null });

  return (
    <>
      <ModalPortfolioItem
        color={color}
        item={state.modalItem}
        open={state.showingModal}
        handleClose={() =>
          setState({ ...state, showingModal: false, modalItem: null })
        }
      />
      <div className="portfolio">
        <div className="content-grid">
          <h1>Portfolio</h1>
          <div className="portfolio-wrapper">
            {PortfolioItems.map((item, i) => {
              return (
                <PortfolioItem
                  key={"portfolio-item-" + i}
                  item={item}
                  onShowMore={() =>
                    setState({ ...state, showingModal: true, modalItem: item })
                  }
                  onShowLess={() =>
                    setState({ ...state, showingModal: false, modalItem: null })
                  }
                />
              );
            })}
          </div>
        </div>
        <ScrollArrow to=".about" />
      </div>
    </>
  );
};
