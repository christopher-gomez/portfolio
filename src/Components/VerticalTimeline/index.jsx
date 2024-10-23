import * as React from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import HotelIcon from "@mui/icons-material/Hotel";
import RepeatIcon from "@mui/icons-material/Repeat";
import Typography from "@mui/material/Typography";
import PortfolioItem, { ImageGrid } from "../PortfolioItem/PortfolioItem";
import "../../styles/CSS/VerticalTimeline.css";

export default ({ items, onShowMore = () => {} }) => {
  const [stateItems, setStateItems] = React.useState(null);

  React.useEffect(() => {
    if (!stateItems) setStateItems(items);
  }, [items]);

  const [viewType, setViewType] = React.useState("cards"); // cards, blurred

  if (!stateItems) return null;

  return (
    <Timeline
      position="alternate"
      sx={{ margin: "auto" }}
      className="vertical-timeline"
    >
      {stateItems?.map((item, index) => (
        <TimelineItem>
          <TimelineOppositeContent
            sx={{ m: "auto 0", color: "black" }}
            align="right"
          >
            <div
              style={{
                display: "flex",
                justifyContent: index % 2 === 1 ? "start" : "end",
              }}
            >
              <div
                className="opposite-info-container"
                style={{
                  paddingLeft: index % 2 === 0 ? "2em" : "1em",
                }}
              >
                <pre style={{ margin: 0 }}>{item.type}</pre>
                <pre style={{ margin: 0 }}>{item.time}</pre>
              </div>
            </div>
            {viewType === "blurred" && (
              <>
                <Typography
                  variant="h2"
                  sx={{
                    background: "rgba(255,255,255,.35)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "0 0 0 0",
                    padding: ".5em",
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  sx={{
                    background: "rgba(255,255,255,.35)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "0 0 .5em .5em",
                    padding: ".5em",
                  }}
                >
                  {item.description}
                </Typography>
              </>
            )}
          </TimelineOppositeContent>
          <TimelineSeparator>
            {<TimelineConnector />}
            <TimelineDot />
            {<TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent
            sx={{
              display: "flex",
              justifyContent: index % 2 !== 0 ? "end" : "start",
            }}
          >
            {viewType === "cards" && (
              <PortfolioItem
                item={item}
                isCondensed={true}
                onShowMore={(item) => onShowMore(item)}
              />
            )}
            {viewType === "blurred" && typeof item.img !== "string" && (
              <ImageGrid images={item.img} />
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};
