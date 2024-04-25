import { Add, Delete, Edit, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Input,
  Paper,
  Slider,
  Switch,
  Typography,
  styled,
} from "@mui/material";
import React, { useState } from "react";

const ColorSwatch = styled(Paper)(({ theme, color }) => ({
  backgroundColor: color,
  width: theme.spacing(4),
  height: theme.spacing(4),
}));

const ColorSwatchContainer = ({ color, onClick, index, HoverIcon }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ position: "relative" }}
      onPointerEnter={() => {
        setHovered(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
      }}
    >
      <ColorSwatch color={color} />
      {hovered && (
        <Paper
          sx={{
            position: "absolute",
            backgroundColor: "rgba(0,0,0,.4)",
            display: "inline-flex",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            size="small"
            sx={{
              p: 0,
              color: "white",
              ">svg": { height: ".75em", width: ".75em" },
            }}
            onClick={() => {
              if (onClick) onClick(index, color);
            }}
          >
            {HoverIcon}
          </IconButton>
        </Paper>
      )}
    </div>
  );
};

export default ({
  UIState,
  setUIState,
  fractalPropertiesState,
  setFractalPropertiesState,
  setEditingColorIndex,
  animationState,
  setAnimationState,
  setColorModalOpen,
  webGLAvailable,
  beginErase,
  originalFractalProperties,
}) => {
  return (
    <Accordion
      onChange={(_, expanded) => {
        setUIState((state) => ({
          ...state,
          controlsOpen: expanded,
        }));
      }}
      sx={{
        p: 0,
        background: "transparent",
        boxShadow: "none",
        border: "none",
        outline: "none",
        "::before": {
          display: "none",
        },
        "&.Mui-expanded": {
          m: 0,
        },
      }}
      defaultExpanded={true}
      expanded={UIState.controlsOpen}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          position: "sticky", // Make the summary sticky
          top: 0, // Position it at the top
          zIndex: 1, // Ensure it's above the details
          p: 0,
          ">*": { mb: ".25em !important", mt: ".5em !important" },
          "&.Mui-expanded": { minHeight: 48 },
          "&.Mui-expanded::after": {
            boxShadow: "0 5px 6px -4px rgba(0,0,0,1)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            left: 5,
            right: 20,
            bottom: 5,
            visibility: "visible", // Change to "hidden" to hide before expanding
            height: "10px",
            boxShadow: "0 5px 6px -4px rgba(0,0,0,0)",
            transition: "box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        }}
      >
        <Typography variant="caption">Controls</Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          // Adjust the max height to control the scrolling area size
          overflowY: "auto", // Enable vertical scrolling
          position: "relative", // Ensure that the scrolling is within this container
          maxHeight: "40vh",
          padding: ".75em 1em .75em 1.25em",
        }}
      >
        <Box sx={{ mt: 0, ml: -2 }}>
          <Typography gutterBottom>Fractal</Typography>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography id="color-label" gutterBottom>
            Color
          </Typography>
          <Grid container spacing={2} columnSpacing={1}>
            {fractalPropertiesState.colors.map((color, i) => (
              <Grid item key={"color-swatch-" + color + i}>
                <ColorSwatchContainer
                  color={color}
                  onClick={(index) => {
                    // setFractalPropertiesState((s) => {
                    //   let newColors = [...s.colors];
                    //   newColors.splice(index, 1);
                    //   return { ...s, colors: newColors };
                    // });

                    setEditingColorIndex(index);
                    setColorModalOpen(true);
                  }}
                  index={i}
                  HoverIcon={<Edit />}
                />
              </Grid>
            ))}
            <Grid item>
              <IconButton
                sx={{ p: 0 }}
                onClick={() => {
                  setFractalPropertiesState((s) => ({
                    ...s,
                    colors: [...s.colors, "rgba(255,255,255,1)"],
                  }));

                  setColorModalOpen(true);
                }}
              >
                <Add />
              </IconButton>
            </Grid>
          </Grid>
        </Box>
        <Box>
          <Typography id="num-paths-label" gutterBottom>
            Paths
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs>
              <Slider
                value={fractalPropertiesState.numPaths}
                onChange={(_, value) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    numPaths: +value,
                  }));
                }}
                min={1}
                max={10}
                step={1}
                valueLabelDisplay="auto"
                aria-labelledby="num-paths-label"
              />
            </Grid>
            <Grid item>
              <Input
                value={fractalPropertiesState.numPaths}
                margin="dense"
                onChange={(e) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    numPaths: e.target.value === "" ? 1 : +e.target.value,
                  }));
                }}
                onBlur={() => {
                  if (fractalPropertiesState.numPaths < 1)
                    setFractalPropertiesState((state) => ({
                      ...state,
                      numPaths: 1,
                    }));
                  else if (fractalPropertiesState.numPaths > 10)
                    setFractalPropertiesState((state) => ({
                      ...state,
                      numPaths: 10,
                    }));
                }}
                inputProps={{
                  step: 1,
                  min: 1,
                  max: 10,
                  type: "number",
                  style: { textAlign: "right" },

                  "aria-labelledby": "num-paths-label",
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box>
          <Typography id="num-iters-label" gutterBottom>
            Iterations
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs>
              <Slider
                value={fractalPropertiesState.iterations}
                onChange={(_, value) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    iterations: +value,
                  }));
                }}
                min={1}
                max={10}
                step={1}
                valueLabelDisplay="auto"
                aria-labelledby="num-iters-label"
              />
            </Grid>
            <Grid item>
              <Input
                value={fractalPropertiesState.iterations}
                margin="dense"
                onChange={(e) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    iterations: e.target.value === "" ? 1 : +e.target.value,
                  }));
                }}
                onBlur={() => {
                  if (fractalPropertiesState.iterations < 1)
                    setFractalPropertiesState((state) => ({
                      ...state,
                      iterations: 1,
                    }));
                  else if (fractalPropertiesState.iterations > 10)
                    setFractalPropertiesState((state) => ({
                      ...state,
                      iterations: 10,
                    }));
                }}
                inputProps={{
                  step: 1,
                  min: 1,
                  max: 10,
                  type: "number",
                  style: { textAlign: "right" },

                  "aria-labelledby": "num-iters-label",
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box>
          <Typography id="min-max-rad-label" gutterBottom>
            Min Radius
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs>
              <Slider
                value={fractalPropertiesState.minMaxRad}
                onChange={(_, value) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    minMaxRad: +value,
                  }));
                }}
                min={0}
                max={fractalPropertiesState.maxMaxRad}
                step={1}
                valueLabelDisplay="auto"
                aria-labelledby="min-max-rad-label"
              />
            </Grid>
            <Grid item>
              <Input
                value={fractalPropertiesState.minMaxRad}
                margin="dense"
                onChange={(e) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    minMaxRad: e.target.value === "" ? 0 : +e.target.value,
                  }));
                }}
                onBlur={() => {
                  if (fractalPropertiesState.minMaxRad < 0)
                    setFractalPropertiesState((state) => ({
                      ...state,
                      minMaxRad: 0,
                    }));
                  else if (
                    fractalPropertiesState.minMaxRad >
                    fractalPropertiesState.maxMaxRad
                  )
                    setFractalPropertiesState((state) => ({
                      ...state,
                      minMaxRad: state.maxMaxRad,
                    }));
                }}
                inputProps={{
                  step: 1,
                  min: 0,
                  max: fractalPropertiesState.maxMaxRad,
                  type: "number",
                  style: { textAlign: "right" },

                  "aria-labelledby": "min-max-rad-label",
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box>
          <Typography id="max-max-rad-label" gutterBottom>
            Max Radius
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs>
              <Slider
                value={fractalPropertiesState.maxMaxRad}
                onChange={(_, value) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    maxMaxRad: +value,
                  }));
                }}
                min={fractalPropertiesState.minMaxRad}
                max={360}
                step={1}
                valueLabelDisplay="auto"
                aria-labelledby="max-max-rad-label"
              />
            </Grid>
            <Grid item>
              <Input
                value={fractalPropertiesState.maxMaxRad}
                margin="dense"
                onChange={(e) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    maxMaxRad:
                      e.target.value === ""
                        ? fractalPropertiesState.minMaxRad
                        : +e.target.value,
                  }));
                }}
                onBlur={() => {
                  if (
                    fractalPropertiesState.maxMaxRad <
                    fractalPropertiesState.minMaxRad
                  )
                    setFractalPropertiesState((state) => ({
                      ...state,
                      maxMaxRad: state.minMaxRad,
                    }));
                  else if (fractalPropertiesState.maxMaxRad > 360)
                    setFractalPropertiesState((state) => ({
                      ...state,
                      maxMaxRad: 360,
                    }));
                }}
                inputProps={{
                  step: 1,
                  min: fractalPropertiesState.minMaxRad,
                  max: 360,
                  type: "number",
                  style: { textAlign: "right" },

                  "aria-labelledby": "max-max-rad-label",
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box>
          <Typography id="min-rad-factor-label" gutterBottom>
            Radius Noise Factor
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs>
              <Slider
                value={fractalPropertiesState.minRadFactor}
                onChange={(_, value) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    minRadFactor: +value,
                  }));
                }}
                min={0}
                max={1}
                step={0.0001}
                valueLabelDisplay="auto"
                aria-labelledby="min-rad-factor-label"
              />
            </Grid>
            <Grid item>
              <Input
                value={fractalPropertiesState.minRadFactor}
                margin="dense"
                onChange={(e) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    minRadFactor: e.target.value === "" ? 0 : +e.target.value,
                  }));
                }}
                onBlur={() => {
                  if (fractalPropertiesState.minRadFactor < 0)
                    setFractalPropertiesState((state) => ({
                      ...state,
                      minRadFactor: 0,
                    }));
                  else if (fractalPropertiesState.minRadFactor > 1)
                    setFractalPropertiesState((state) => ({
                      ...state,
                      minRadFactor: 1,
                    }));
                }}
                inputProps={{
                  step: 0.0001,
                  min: 0,
                  max: 1,
                  type: "number",
                  style: { textAlign: "right" },
                  "aria-labelledby": "min-rad-factor-label",
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box>
          <Typography id="line-width-label" gutterBottom>
            Line Width
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs>
              <Slider
                value={fractalPropertiesState.lineWidth}
                onChange={(_, value) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    lineWidth: +value,
                  }));
                }}
                min={0.01}
                max={1}
                step={0.01}
                valueLabelDisplay="auto"
                aria-labelledby="line-width-label"
              />
            </Grid>
            <Grid item>
              <Input
                value={fractalPropertiesState.lineWidth}
                margin="dense"
                onChange={(e) => {
                  setFractalPropertiesState((state) => ({
                    ...state,
                    lineWidth: e.target.value === "" ? 0.01 : +e.target.value,
                  }));
                }}
                onBlur={() => {
                  if (fractalPropertiesState.lineWidth < 0.01)
                    setFractalPropertiesState((state) => ({
                      ...state,
                      lineWidth: 0.01,
                    }));
                  else if (fractalPropertiesState.lineWidth > 1)
                    setFractalPropertiesState((state) => ({
                      ...state,
                      lineWidth: 1,
                    }));
                }}
                inputProps={{
                  step: 0.01,
                  min: 0.01,
                  max: 1,
                  type: "number",
                  style: { textAlign: "right" },

                  "aria-labelledby": "line-width-label",
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ ml: -2 }}>
          <Typography gutterBottom>Animation</Typography>
        </Box>
        <Box>
          <Typography id="num-draws-label" gutterBottom>
            Draws Per Frame
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <Slider
                value={animationState.drawsPerFrame}
                onChange={(_, value) => {
                  setAnimationState((state) => ({
                    ...state,
                    drawsPerFrame: +value,
                  }));
                }}
                min={1}
                max={100}
                step={1}
                valueLabelDisplay="auto"
                aria-labelledby="num-draws-label"
              />
            </Grid>
            <Grid item xs={2}>
              <Input
                value={animationState.drawsPerFrame}
                margin="dense"
                onChange={(e) => {
                  setAnimationState((state) => ({
                    ...state,
                    drawsPerFrame: e.target.value === "" ? 1 : +e.target.value,
                  }));
                }}
                onBlur={() => {
                  if (animationState.drawsPerFrame < 1)
                    setAnimationState((state) => ({
                      ...state,
                      drawsPerFrame: 1,
                    }));
                  else if (animationState.drawsPerFrame > 100)
                    setAnimationState((state) => ({
                      ...state,
                      drawsPerFrame: 100,
                    }));
                }}
                inputProps={{
                  step: 1,
                  min: 1,
                  max: 100,
                  type: "number",
                  style: { textAlign: "right" },

                  "aria-labelledby": "num-draws-label",
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={animationState.shouldEraseOnRedraw}
                onChange={(_, checked) => {
                  setAnimationState((s) => ({
                    ...s,
                    shouldEraseOnRedraw: checked,
                  }));
                }}
              />
            }
            labelPlacement="start"
            label={
              <Typography id="erase-on-redraw-label">
                Erase Animation
              </Typography>
            }
            sx={{ m: 0 }}
          />
        </Box>

        <Box>
          <Grid container spacing={1}>
            <Grid item>
              <FormControlLabel
                control={
                  <Switch
                    checked={animationState.fpsLimit !== -1}
                    onChange={(e, checked) => {
                      setAnimationState((state) => ({
                        ...state,
                        fpsLimit: checked ? 60 : -1,
                      }));
                    }}
                  />
                }
                labelPlacement="start"
                label={<Typography id="fps-limit-label">FPS Limit</Typography>}
                sx={{ m: 0 }}
                // label={
                //   <Typography id="fps-limit-label">
                //     Unlimited
                //   </Typography>
                // }
              />
            </Grid>
            {animationState.fpsLimit !== -1 && (
              <Grid item xs={2}>
                <Input
                  value={animationState.fpsLimit}
                  margin="dense"
                  onChange={(e) => {
                    setAnimationState((state) => ({
                      ...state,
                      fpsLimit: e.target.value === "" ? 30 : +e.target.value,
                    }));
                  }}
                  onBlur={() => {
                    if (animationState.fpsLimit < 1)
                      setAnimationState((state) => ({
                        ...state,
                        fpsLimit: 1,
                      }));
                  }}
                  inputProps={{
                    step: 1,
                    min: 1,
                    type: "number",
                    style: { textAlign: "right" },
                    "aria-labelledby": "fps-limit-label",
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Box>
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={animationState.shouldAutoRedraw}
                onChange={(e, checked) => {
                  setAnimationState((s) => ({
                    ...s,
                    shouldAutoRedraw: checked,
                  }));

                  if (
                    checked &&
                    !animationState.isDrawing &&
                    !animationState.isErasing
                  ) {
                    beginErase();
                    setUIState((s) => ({ ...s, controlsOpen: false }));
                  }
                }}
              />
            }
            labelPlacement="start"
            label={<Typography id="auto-redraw-label">Auto Redraw</Typography>}
            sx={{ m: 0 }}
          />
        </Box>
        <Box sx={{ ml: -2 }}>
          <Typography gutterBottom>WebGL</Typography>
        </Box>
        <Box>
          <FormControlLabel
            control={
              <Switch
                disabled={!webGLAvailable}
                checked={animationState.useWebGL}
                onChange={(e, checked) => {
                  setAnimationState((s) => ({
                    ...s,
                    useWebGL: checked,
                    drawsPerFrame: checked
                      ? s.drawsPerFrame < 12
                        ? 12
                        : s.drawsPerFrame
                      : s.drawsPerFrame,
                  }));
                }}
              />
            }
            labelPlacement="start"
            label={<Typography id="web-gl-label">Use WebGL</Typography>}
            sx={{ m: 0 }}
          />
        </Box>
        {animationState.useWebGL && (
          <>
            <Box>
              <Typography id="webgl-x-drift-factor-label" gutterBottom>
                X Drift
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={10}>
                  <Slider
                    value={fractalPropertiesState.webGL.xDriftFactor}
                    onChange={(_, value) => {
                      setFractalPropertiesState((state) => ({
                        ...state,
                        webGL: {
                          ...state.webGL,
                          xDriftFactor: +value,
                        },
                      }));
                    }}
                    min={0}
                    max={1}
                    step={0.01}
                    valueLabelDisplay="auto"
                    aria-labelledby="webgl-x-drift-factor-label"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Input
                    value={fractalPropertiesState.webGL.xDriftFactor}
                    margin="dense"
                    onChange={(e) => {
                      setFractalPropertiesState((state) => ({
                        ...state,
                        webGL: {
                          ...state.webGL,
                          xDriftFactor:
                            e.target.value === "" ? 0 : +e.target.value,
                        },
                      }));
                    }}
                    onBlur={() => {
                      if (fractalPropertiesState.webGL.xDriftFactor < 0)
                        setFractalPropertiesState((state) => ({
                          ...state,
                          webGL: {
                            ...state.webGL,
                            xDriftFactor: 0,
                          },
                        }));
                      else if (fractalPropertiesState.webGL.xDriftFactor > 1)
                        setFractalPropertiesState((state) => ({
                          ...state,
                          webGL: {
                            ...state.webGL,
                            xDriftFactor: 1,
                          },
                        }));
                    }}
                    inputProps={{
                      step: 0.01,
                      min: 0,
                      max: 1,
                      type: "number",
                      style: { textAlign: "right" },

                      "aria-labelledby": "webgl-x-drift-factor-label",
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Typography id="webgl-y-drift-factor-label" gutterBottom>
                Y Drift
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={10}>
                  <Slider
                    value={fractalPropertiesState.webGL.yDriftFactor}
                    onChange={(_, value) => {
                      setFractalPropertiesState((state) => ({
                        ...state,
                        webGL: {
                          ...state.webGL,
                          yDriftFactor: +value,
                        },
                      }));
                    }}
                    min={0}
                    max={1}
                    step={0.01}
                    valueLabelDisplay="auto"
                    aria-labelledby="webgl-y-drift-factor-label"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Input
                    value={fractalPropertiesState.webGL.yDriftFactor}
                    margin="dense"
                    onChange={(e) => {
                      setFractalPropertiesState((state) => ({
                        ...state,
                        webGL: {
                          ...state.webGL,
                          yDriftFactor:
                            e.target.value === "" ? 0 : +e.target.value,
                        },
                      }));
                    }}
                    onBlur={() => {
                      if (fractalPropertiesState.webGL.yDriftFactor < 0)
                        setFractalPropertiesState((state) => ({
                          ...state,
                          webGL: {
                            ...state.webGL,
                            yDriftFactor: 0,
                          },
                        }));
                      else if (fractalPropertiesState.webGL.yDriftFactor > 1)
                        setFractalPropertiesState((state) => ({
                          ...state,
                          webGL: {
                            ...state.webGL,
                            yDriftFactor: 1,
                          },
                        }));
                    }}
                    inputProps={{
                      step: 0.01,
                      min: 0,
                      max: 1,
                      type: "number",
                      style: { textAlign: "right" },

                      "aria-labelledby": "webgl-y-drift-factor-label",
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Typography id="webgl-noise-scale-label" gutterBottom>
                Noise Scale
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={10}>
                  <Slider
                    value={fractalPropertiesState.webGL.noiseScale}
                    onChange={(_, value) => {
                      setFractalPropertiesState((state) => ({
                        ...state,
                        webGL: {
                          ...state.webGL,
                          noiseScale: +value,
                        },
                      }));
                    }}
                    min={0}
                    max={100}
                    step={0.1}
                    valueLabelDisplay="auto"
                    aria-labelledby="webgl-noise-scale-label"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Input
                    value={fractalPropertiesState.webGL.noiseScale}
                    margin="dense"
                    onChange={(e) => {
                      setFractalPropertiesState((state) => ({
                        ...state,
                        webGL: {
                          ...state.webGL,
                          noiseScale:
                            e.target.value === "" ? 0 : +e.target.value,
                        },
                      }));
                    }}
                    onBlur={() => {
                      if (fractalPropertiesState.webGL.noiseScale < 0)
                        setFractalPropertiesState((state) => ({
                          ...state,
                          webGL: {
                            ...state.webGL,
                            noiseScale: 0,
                          },
                        }));
                      else if (fractalPropertiesState.webGL.noiseScale > 100)
                        setFractalPropertiesState((state) => ({
                          ...state,
                          webGL: {
                            ...state.webGL,
                            noiseScale: 100,
                          },
                        }));
                    }}
                    inputProps={{
                      step: 0.1,
                      min: 0,
                      max: 100,
                      type: "number",
                      style: { textAlign: "right" },

                      "aria-labelledby": "webgl-noise-scale-label",
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Typography id="webgl-distortion-label" gutterBottom>
                Distortion
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={10}>
                  <Slider
                    value={fractalPropertiesState.webGL.distortion}
                    onChange={(_, value) => {
                      setFractalPropertiesState((state) => ({
                        ...state,
                        webGL: {
                          ...state.webGL,
                          distortion: +value,
                        },
                      }));
                    }}
                    min={0}
                    max={1}
                    step={0.01}
                    valueLabelDisplay="auto"
                    aria-labelledby="webgl-distortion-label"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Input
                    value={fractalPropertiesState.webGL.distortion}
                    margin="dense"
                    onChange={(e) => {
                      setFractalPropertiesState((state) => ({
                        ...state,
                        webGL: {
                          ...state.webGL,
                          distortion:
                            e.target.value === "" ? 0 : +e.target.value,
                        },
                      }));
                    }}
                    onBlur={() => {
                      if (fractalPropertiesState.webGL.distortion < 0)
                        setFractalPropertiesState((state) => ({
                          ...state,
                          webGL: {
                            ...state.webGL,
                            distortion: 0,
                          },
                        }));
                      else if (fractalPropertiesState.webGL.distortion > 1)
                        setFractalPropertiesState((state) => ({
                          ...state,
                          webGL: {
                            ...state.webGL,
                            distortion: 1,
                          },
                        }));
                    }}
                    inputProps={{
                      step: 0.01,
                      min: 0,
                      max: 1,
                      type: "number",
                      style: { textAlign: "right" },

                      "aria-labelledby": "webgl-distortion-label",
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </AccordionDetails>
      <AccordionActions sx={{ pl: 0, pr: 0 }}>
        <Button
          onClick={() => {
            setFractalPropertiesState((s) => ({
              ...originalFractalProperties,
            }));
          }}
        >
          Reset Properties
        </Button>
        <Button
          onClick={() => {
            beginErase();

            setUIState((s) => ({ ...s, controlsOpen: false }));
          }}
        >
          Draw
        </Button>
      </AccordionActions>
    </Accordion>
  );
};
