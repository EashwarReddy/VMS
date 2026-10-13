import { useState } from "react";
import { Truck, Hotel } from "lucide-react";
import styles from "./workspace.module.css";

export default function TravelAccommodation({ visit, onSave, editable }) {
  const [plan, setPlan] = useState(
    visit.plan || { vehicle: "", pickup: visit.pickup || "", stay: "" }
  );
  return (
    <section
      className={styles.detailSection}
      aria-label="Travel & Accommodation module"
    >
      <h3>
        <Truck size={18} />
        Travel & Accommodation
      </h3>
      {editable && visit.status === "Approved" ? (
        <form
          className={styles.formGrid}
          onSubmit={(e) => {
            e.preventDefault();
            onSave(plan);
          }}
        >
          {visit.transport && (
            <>
              <label className={styles.field}>
                <span>Vehicle / travel arrangement</span>
                <input
                  required
                  maxLength={200}
                  value={plan.vehicle}
                  onChange={(e) =>
                    setPlan({ ...plan, vehicle: e.target.value })
                  }
                />
              </label>
              <label className={styles.field}>
                <span>Pickup location & time</span>
                <input
                  required
                  maxLength={200}
                  value={plan.pickup}
                  onChange={(e) => setPlan({ ...plan, pickup: e.target.value })}
                />
              </label>
            </>
          )}
          {visit.accommodation && (
            <label className={styles.field}>
              <span>Accommodation</span>
              <input
                required
                maxLength={200}
                value={plan.stay}
                onChange={(e) => setPlan({ ...plan, stay: e.target.value })}
                placeholder="Guest house and room"
              />
            </label>
          )}
          <button className={styles.primaryButton} type="submit">
            Save arrangements
          </button>
        </form>
      ) : (
        <>
          <p>
            <Truck size={14} />{" "}
            {visit.transport
              ? visit.plan?.vehicle || "Transport arrangements pending"
              : "No transport requested"}
          </p>
          {visit.transport && <p>{visit.plan?.pickup || visit.pickup}</p>}
          <p>
            <Hotel size={14} />{" "}
            {visit.accommodation
              ? visit.plan?.stay || "Accommodation pending"
              : "No accommodation requested"}
          </p>
        </>
      )}
    </section>
  );
}
