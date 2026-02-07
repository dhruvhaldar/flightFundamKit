# SD2601 Flight Fundamentals Toolkit

This project is a computational toolkit developed to accompany the **SD2601 Fundamentals of Flight** course at KTH. It provides Octave/MATLAB implementations of key concepts in atmospheric flight, aerodynamics, and aircraft performance, directly addressing the intended learning outcomes of the course.

## Overview

The toolkit is designed to help students:
*   **Calculate atmospheric properties** at different altitudes.
*   **Analyze aerodynamic characteristics** such as lift, drag, and stall speed.
*   **Evaluate aircraft performance** including power required, rate of climb, range, and endurance.

It serves as both a library of functions and a template for the course project (PRO1/PRO2).

## Syllabus Alignment

This project directly supports the following course topics and learning outcomes:

### 1. The Atmosphere
*   **Syllabus Topic:** "Basic aspects of atmospheric flight"
*   **Implementation:** `std_atm.m`
    *   Calculates Temperature, Pressure, Density, and Speed of Sound based on the International Standard Atmosphere (ISA) model.
    *   Essential for all performance calculations.

### 2. Aerodynamics
*   **Syllabus Topic:** "Aircraft aerodynamics", "Describe the component and subcomponents of an aircraft"
*   **Implementation:**
    *   `drag_polar.m`: Models the drag polar $C_D = C_{D0} + k C_L^2$.
    *   `lift_coeff.m`: Calculates Lift Coefficient from weight and flight conditions.
    *   `stall_speed.m`: Determines the minimum flight speed based on $C_{Lmax}$.

### 3. Performance & Flight Mechanics
*   **Syllabus Topic:** "Aircraft performance", "Calculate aerodynamic and flight performance"
*   **Implementation:**
    *   `power_required.m`: Generates the Power Required curve ($P_R$ vs $V$).
    *   `rate_of_climb.m`: Calculates Rate of Climb ($RC$) based on Power Available ($P_a$) and Power Required ($P_r$).
    *   `range_breguet.m`: Estimates aircraft range using the Breguet Range Equation for both propeller and jet aircraft.
    *   `gliding_range.m`: Calculates maximum gliding distance.

## Project Structure

The project is organized as follows:

```
flight_fundamentals/
├── std_atm.m          # Atmosphere model (ISA)
├── drag_polar.m       # Aerodynamic drag model
├── lift_coeff.m       # Lift coefficient calculation
├── stall_speed.m      # Stall speed calculation
├── power_required.m   # Power required calculation
├── rate_of_climb.m    # Rate of climb calculation
├── range_breguet.m    # Range calculation (Prop & Jet)
├── gliding_range.m    # Gliding performance
├── main_project.m     # Example analysis script (Project Template)
└── README.md          # This documentation
```

## How to Run

### Prerequisites
*   **GNU Octave** (Recommended) or MATLAB.

### Running the Analysis
1.  Open a terminal or Octave command window.
2.  Navigate to the project directory:
    ```bash
    cd flight_fundamentals
    ```
3.  Run the main project script:
    ```matlab
    main_project
    ```

### Expected Output
The `main_project.m` script performs a full performance analysis of a hypothetical light aircraft (similar to a Cessna 172). It will:
1.  Display calculated performance metrics (Stall Speed, Max Speed, Max Range) in the console.
2.  Generate and save the following plots:
    *   `plot_power_curve.png`: Power Required vs. Velocity.
    *   `plot_climb_performance.png`: Max Rate of Climb vs. Altitude.

## Example Usage

You can use the individual functions in your own scripts. For example, to calculate the air density at 5000 meters:

```matlab
[T, P, rho, a] = std_atm(5000);
fprintf('Density at 5000m: %.4f kg/m^3\n', rho);
```

To calculate the stall speed of a 10,000 N aircraft with 20 $m^2$ wing area at sea level ($C_{Lmax}=1.5$):

```matlab
[~, ~, rho, ~] = std_atm(0);
V_stall = stall_speed(10000, rho, 20, 1.5);
```

## License
This project is created for educational purposes related to the SD2601 course.
