import { useState, useEffect } from "react";

import { Sparklines, SparklinesLine } from "react-sparklines";
import { Link } from "react-router-dom";

// interfaces
interface IProps {
  item: any;
  onSelect?: (symbol: string) => void;
}

const MarketRow: React.FC<IProps> = ({ item, onSelect }) => {
  const [color, setColor] = useState<string>("");

  useEffect(() => {
    if (item.status === 1) {
      setColor("green");
    } else {
      setColor("red");
    }
  }, [item.status]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => item.symbol && onSelect?.(item.symbol)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          item.symbol && onSelect?.(item.symbol);
        }
      }}
      className="market-row flex flex-center flex-space-between"
      style={{
        width: "100%",
        background: item.selected ? "var(--primary-opaque, rgba(0,0,0,0.04))" : "transparent",
        cursor: "pointer",
        textAlign: "left",
        borderRadius: 8,
      }}
    >
      <div>
        <div
          className="icon cover"
          style={{ backgroundImage: `url('${item.icon}')` }}
        />
      </div>
      <div>
        <p>
          <strong>{item.name}</strong>
          <span className="gray">{item.date}</span>
        </p>
      </div>
      <div>
        <Sparklines data={item.lineChartData} width={50} height={50}>
          <SparklinesLine
            style={{ strokeWidth: 2, fill: "none" }}
            color={color}
          />
        </Sparklines>
      </div>
      <div>
        <p className="right">
          <strong>
            {item.amount} {item.currency}
          </strong>
          <span className={color}>{item.change}</span>
        </p>
      </div>
      <div>
        <p className="right">
          <strong>{item.high || "--"}</strong>
          <span className="gray">High</span>
        </p>
      </div>
      <div>
        <p className="right">
          <strong>{item.low || "--"}</strong>
          <span className="gray">Low</span>
        </p>
      </div>
      <div>
        <p className="right">
          <strong>{item.volume || "--"}</strong>
          <span className="gray">24H Vol</span>
        </p>
      </div>
      <div>
        <Link
          to={item.symbol ? `/trade/${item.symbol}` : "/market"}
          className="button button-purple button-small"
          style={{ minWidth: 86, textAlign: "center" }}
          onClick={(event) => event.stopPropagation()}
        >
          {item.actionLabel || "Trade"}
        </Link>
      </div>
    </div>
  );
};

export default MarketRow;
