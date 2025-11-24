import { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import { Sparklines, SparklinesLine, SparklinesBars } from "react-sparklines";

// interface
interface IProps {
  item: any;
}

const MyAssetsRow: React.FC<IProps> = ({ item }) => {
  return (
    <div className="assets-row flex flex-center flex-space-between">
      <div>
        <div
          className="icon cover"
          style={{ backgroundImage: `url('${item.icon}')` }}
        />
      </div>
      <div className="standard-width">
        <strong>{item.name}</strong>
        <span>{item.symbol}</span>
      </div>

      <div className="standard-width" style={{ textAlign: 'right' }}>
        <strong>
          {item.amount} {item.currency}
        </strong>
      </div>

      <div className="nowrap no-select">
        <Link to="/deposit">
          <i className="material-icons">add_circle</i>
        </Link>
      </div>
    </div>
  );
};

export default MyAssetsRow;
